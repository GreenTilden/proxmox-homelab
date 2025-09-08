# Project Knowledge Base System Architecture

**Created**: 2025-08-26  
**Thread Origin**: Documentation Thread - UI Implementation Architecture  
**Purpose**: Complete system architecture design for GBGreg project upload and review interface with AI-powered knowledge base expansion

## 🏗️ **System Architecture Overview**

### **High-Level Architecture Design**
```yaml
Project_Knowledge_Base_System:
  Frontend_Layer:
    - Vue 3 + TypeScript responsive web application
    - Tab-based interface preserving existing GBGreg functionality
    - Progressive web app with offline project browsing capabilities
    - Mobile-first responsive design with 16-bit gaming theme integration
    
  API_Gateway_Layer:
    - RESTful API with authentication and authorization
    - File upload handling with multipart and progress tracking
    - Request routing and rate limiting for scalable performance
    - Integration with existing GBGreg AI service endpoints
    
  Backend_Services_Layer:
    - Microservices architecture for scalability and maintainability
    - Upload processing service with secure file handling
    - Content analysis service with AI integration
    - Search service with full-text and semantic capabilities
    - Database service with backup and recovery procedures
    
  Data_Storage_Layer:
    - PostgreSQL for structured project metadata and relationships
    - Elasticsearch for searchable content indexing
    - File system storage for project archives and extracted content
    - Redis for caching and session management
    
  AI_Integration_Layer:
    - DeepSeek Coder 6.7B integration for project summarization
    - Pattern recognition engine for cross-project analysis
    - Content similarity analysis using vector embeddings
    - Safety validation pipeline integration for uploaded content
```

### **Component Interaction Flow**
```mermaid
graph TD
    A[User Upload ZIP] --> B[API Gateway]
    B --> C[Upload Processing Service]
    C --> D[File Extraction & Validation]
    D --> E[Content Analysis Service]
    E --> F[AI Summarization Service]
    F --> G[Database Service]
    G --> H[Search Index Service]
    H --> I[Project Metadata Storage]
    
    J[User Project Browse] --> K[Search Service]
    K --> L[Database Query]
    L --> M[AI Recommendation Engine]
    M --> N[Frontend Project Display]
```

## 🗄️ **Database Architecture Design**

### **Core Database Schema**
```sql
-- Main projects table with comprehensive metadata
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    
    -- AI-generated analysis
    ai_summary TEXT,
    project_description TEXT,
    project_type VARCHAR(100),
    complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10),
    
    -- Technical classification
    primary_technologies TEXT[] DEFAULT '{}',
    framework_stack TEXT[] DEFAULT '{}',
    deployment_type VARCHAR(100),
    infrastructure_type VARCHAR(100),
    
    -- Folder structure analysis
    folder_structure JSONB,
    priority_folders TEXT[] DEFAULT '{}',
    additional_folders TEXT[] DEFAULT '{}',
    total_files INTEGER DEFAULT 0,
    
    -- Content analysis
    key_patterns TEXT[] DEFAULT '{}',
    documentation_quality_score INTEGER CHECK (documentation_quality_score >= 1 AND documentation_quality_score <= 10),
    code_quality_indicators JSONB,
    
    -- Search and indexing
    searchable_content TSVECTOR,
    content_hash VARCHAR(64) UNIQUE,
    tags TEXT[] DEFAULT '{}',
    
    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File system mapping for direct documentation access
CREATE TABLE project_files (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    file_path VARCHAR(1000) NOT NULL,
    relative_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(100),
    file_extension VARCHAR(20),
    file_size_bytes BIGINT,
    
    -- Content analysis
    is_key_file BOOLEAN DEFAULT FALSE,
    file_purpose VARCHAR(100), -- 'documentation', 'configuration', 'script', 'agent', 'data'
    content_summary TEXT,
    extracted_metadata JSONB,
    
    -- File content for direct access
    content_preview TEXT, -- First 1000 characters for quick preview
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, relative_path)
);

-- Project relationships and similarity analysis
CREATE TABLE project_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    related_project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    
    -- Similarity analysis
    similarity_score DECIMAL(5,4) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    relationship_type VARCHAR(100), -- 'similar_technology', 'similar_patterns', 'complementary', 'evolutionary'
    
    -- Relationship details
    shared_technologies TEXT[] DEFAULT '{}',
    shared_patterns TEXT[] DEFAULT '{}',
    similarity_reasons TEXT[] DEFAULT '{}',
    
    -- Confidence and validation
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    validated_by_user BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(source_project_id, related_project_id)
);

-- Knowledge extraction for pattern recognition
CREATE TABLE extracted_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    pattern_name VARCHAR(255) NOT NULL,
    pattern_category VARCHAR(100), -- 'infrastructure', 'configuration', 'workflow', 'architecture'
    pattern_description TEXT,
    
    -- Pattern details
    file_sources TEXT[] DEFAULT '{}', -- Files where pattern was found
    code_examples TEXT[] DEFAULT '{}',
    configuration_templates JSONB,
    
    -- Pattern metadata
    complexity_level INTEGER CHECK (complexity_level >= 1 AND complexity_level <= 5),
    reusability_score INTEGER CHECK (reusability_score >= 1 AND reusability_score <= 10),
    pattern_tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions and feedback
CREATE TABLE user_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    interaction_type VARCHAR(100), -- 'view', 'download', 'rate', 'comment', 'bookmark'
    
    -- Interaction details
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_comment TEXT,
    interaction_metadata JSONB,
    
    -- Session tracking
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Database Indexing Strategy**
```sql
-- Performance optimization indexes
CREATE INDEX projects_search_idx ON projects USING GIN (searchable_content);
CREATE INDEX projects_tech_idx ON projects USING GIN (primary_technologies);
CREATE INDEX projects_type_idx ON projects (project_type, complexity_score);
CREATE INDEX projects_status_idx ON projects (processing_status);
CREATE INDEX projects_timestamp_idx ON projects (upload_timestamp DESC);

-- File access optimization
CREATE INDEX project_files_path_idx ON project_files (project_id, relative_path);
CREATE INDEX project_files_type_idx ON project_files (project_id, file_type);
CREATE INDEX project_files_key_idx ON project_files (project_id, is_key_file) WHERE is_key_file = TRUE;

-- Relationship and similarity optimization
CREATE INDEX relationships_source_idx ON project_relationships (source_project_id, similarity_score DESC);
CREATE INDEX relationships_similarity_idx ON project_relationships (similarity_score DESC) WHERE similarity_score > 0.7;

-- Pattern recognition optimization
CREATE INDEX patterns_category_idx ON extracted_patterns (pattern_category, reusability_score DESC);
CREATE INDEX patterns_project_idx ON extracted_patterns (project_id, complexity_level);

-- User interaction analytics
CREATE INDEX interactions_project_idx ON user_interactions (project_id, interaction_type);
CREATE INDEX interactions_timestamp_idx ON user_interactions (created_at DESC);
```

## 🚀 **Backend Services Architecture**

### **Upload Processing Service**
```python
# Upload Processing Service Implementation
from typing import Dict, List, Optional
import zipfile
import tempfile
import hashlib
from pathlib import Path

class ProjectUploadProcessor:
    def __init__(self, config: Dict):
        self.max_file_size = config.get('max_file_size', 500 * 1024 * 1024)  # 500MB
        self.staging_directory = Path(config.get('staging_dir', '/tmp/project-staging'))
        self.allowed_extensions = {'.zip', '.tar.gz', '.tar.bz2'}
        
    async def process_upload(self, upload_file) -> Dict:
        \"\"\"Process uploaded project file with validation and extraction\"\"\"
        
        # Phase 1: Validation and security checks
        validation_result = await self.validate_upload(upload_file)
        if not validation_result['valid']:
            return {'status': 'error', 'message': validation_result['error']}
        
        # Phase 2: File extraction to secure staging area
        extraction_result = await self.extract_project(upload_file)
        if not extraction_result['success']:
            return {'status': 'error', 'message': extraction_result['error']}
            
        # Phase 3: Project structure analysis
        structure_analysis = await self.analyze_structure(extraction_result['extract_path'])
        
        # Phase 4: Content processing and metadata extraction
        content_analysis = await self.process_content(
            extraction_result['extract_path'], 
            structure_analysis
        )
        
        # Phase 5: AI summarization integration
        ai_analysis = await self.generate_ai_summary(content_analysis)
        
        # Phase 6: Database persistence
        project_record = await self.persist_project(
            upload_file, structure_analysis, content_analysis, ai_analysis
        )
        
        return {
            'status': 'success',
            'project_id': project_record['project_id'],
            'project_name': project_record['project_name'],
            'structure_analysis': structure_analysis,
            'ai_summary': ai_analysis['summary'],
            'processing_time': project_record['processing_time']
        }
    
    async def analyze_structure(self, extract_path: Path) -> Dict:
        \"\"\"Analyze project folder structure with priority classification\"\"\"
        
        priority_1_folders = ['.agents', 'docs', 'scripts', 'configs', 'backend/data']
        priority_2_folders = ['frontend', 'tests', 'examples', 'workflows']
        
        structure = {
            'priority_1_found': [],
            'priority_2_found': [],
            'additional_folders': [],
            'total_files': 0,
            'file_types': {},
            'key_files': []
        }
        
        for root, dirs, files in extract_path.rglob('*'):
            # Classify folders by priority
            for folder in dirs:
                relative_path = str(Path(root) / folder)
                if any(p1 in relative_path for p1 in priority_1_folders):
                    structure['priority_1_found'].append(relative_path)
                elif any(p2 in relative_path for p2 in priority_2_folders):
                    structure['priority_2_found'].append(relative_path)
                else:
                    structure['additional_folders'].append(relative_path)
            
            # Analyze files
            for file in files:
                structure['total_files'] += 1
                file_ext = Path(file).suffix.lower()
                structure['file_types'][file_ext] = structure['file_types'].get(file_ext, 0) + 1
                
                # Identify key files
                if file.lower() in ['readme.md', 'readme.txt', 'architecture.md', 'claude.md']:
                    structure['key_files'].append(str(Path(root) / file))
        
        return structure
```

### **AI Integration Service**
```python
# AI Integration Service for project analysis
class ProjectAIAnalyzer:
    def __init__(self, deepseek_endpoint: str):
        self.deepseek_endpoint = deepseek_endpoint
        self.analysis_prompts = self.load_analysis_prompts()
    
    async def generate_project_summary(self, project_content: Dict) -> Dict:
        \"\"\"Generate comprehensive AI summary of uploaded project\"\"\"
        
        # Prepare content for AI analysis
        analysis_context = self.prepare_analysis_context(project_content)
        
        # Generate multiple AI analysis components
        analysis_tasks = await asyncio.gather(
            self.generate_executive_summary(analysis_context),
            self.analyze_technical_stack(analysis_context),
            self.extract_key_patterns(analysis_context),
            self.assess_project_complexity(analysis_context),
            self.identify_similar_projects(analysis_context)
        )
        
        return {
            'executive_summary': analysis_tasks[0],
            'technical_stack': analysis_tasks[1],
            'key_patterns': analysis_tasks[2],
            'complexity_assessment': analysis_tasks[3],
            'similar_projects': analysis_tasks[4],
            'analysis_confidence': self.calculate_confidence_score(analysis_tasks),
            'generated_at': datetime.utcnow().isoformat()
        }
    
    async def generate_executive_summary(self, context: Dict) -> str:
        \"\"\"Generate executive summary using DeepSeek Coder\"\"\"
        
        prompt = f\"\"\"
        Analyze this project and provide a comprehensive executive summary:
        
        Project Structure: {context['structure']}
        Key Documentation: {context['key_docs']}
        Configuration Files: {context['configs']}
        Scripts and Automation: {context['scripts']}
        
        Generate a professional summary covering:
        1. Project purpose and objectives
        2. Technical implementation approach
        3. Key technologies and frameworks
        4. Deployment and operational considerations
        5. Notable patterns or innovations
        
        Focus on actionable insights for technical teams.
        \"\"\"
        
        response = await self.query_deepseek(prompt)
        return response['summary']
    
    async def identify_similar_projects(self, context: Dict) -> List[Dict]:
        \"\"\"Find similar projects in database using AI analysis\"\"\"
        
        # Extract key characteristics for similarity matching
        project_features = self.extract_project_features(context)
        
        # Query database for potential matches
        candidate_projects = await self.query_similar_projects(project_features)
        
        # Use AI to assess similarity and provide reasoning
        similarity_analysis = await self.analyze_project_similarities(
            context, candidate_projects
        )
        
        return similarity_analysis
```

### **Search Service Architecture**
```python
# Search Service with full-text and semantic capabilities
from elasticsearch import AsyncElasticsearch
from sentence_transformers import SentenceTransformer

class ProjectSearchService:
    def __init__(self, elasticsearch_url: str):
        self.es_client = AsyncElasticsearch([elasticsearch_url])
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    async def index_project(self, project: Dict) -> bool:
        \"\"\"Index project for searchable content\"\"\"
        
        # Prepare search document
        search_doc = {
            'project_id': project['project_id'],
            'project_name': project['project_name'],
            'project_type': project['project_type'],
            'technologies': project['primary_technologies'],
            'summary': project['ai_summary'],
            'content': project['searchable_content'],
            
            # Vector embeddings for semantic search
            'content_vector': self.sentence_model.encode(
                f\"{project['ai_summary']} {project['searchable_content']}\"
            ).tolist(),
            
            'upload_timestamp': project['upload_timestamp'],
            'complexity_score': project['complexity_score'],
            'tags': project.get('tags', [])
        }
        
        # Index in Elasticsearch
        await self.es_client.index(
            index='projects',
            id=project['project_id'],
            document=search_doc
        )
        
        return True
    
    async def search_projects(self, query: str, filters: Dict = None) -> List[Dict]:
        \"\"\"Comprehensive project search with full-text and semantic matching\"\"\"
        
        # Build Elasticsearch query
        es_query = {
            'query': {
                'bool': {
                    'should': [
                        # Full-text search
                        {
                            'multi_match': {
                                'query': query,
                                'fields': ['project_name^3', 'summary^2', 'content', 'technologies'],
                                'type': 'best_fields',
                                'fuzziness': 'AUTO'
                            }
                        },
                        # Technology-specific boost
                        {
                            'terms': {
                                'technologies': query.split(),
                                'boost': 2.0
                            }
                        }
                    ],
                    'minimum_should_match': 1
                }
            },
            'sort': [
                {'_score': {'order': 'desc'}},
                {'upload_timestamp': {'order': 'desc'}}
            ],
            'size': 50
        }
        
        # Apply filters if provided
        if filters:
            es_query['query']['bool']['filter'] = []
            
            if 'project_type' in filters:
                es_query['query']['bool']['filter'].append({
                    'term': {'project_type': filters['project_type']}
                })
                
            if 'technologies' in filters:
                es_query['query']['bool']['filter'].append({
                    'terms': {'technologies': filters['technologies']}
                })
                
            if 'complexity_range' in filters:
                es_query['query']['bool']['filter'].append({
                    'range': {
                        'complexity_score': {
                            'gte': filters['complexity_range'][0],
                            'lte': filters['complexity_range'][1]
                        }
                    }
                })
        
        # Execute search
        search_result = await self.es_client.search(
            index='projects',
            body=es_query
        )
        
        # Process and return results
        projects = []
        for hit in search_result['hits']['hits']:
            project = hit['_source']
            project['relevance_score'] = hit['_score']
            projects.append(project)
        
        return projects
    
    async def semantic_search(self, query: str, limit: int = 20) -> List[Dict]:
        \"\"\"Semantic search using vector similarity\"\"\"
        
        # Generate query vector
        query_vector = self.sentence_model.encode(query).tolist()
        
        # Vector similarity search
        vector_query = {
            'query': {
                'script_score': {
                    'query': {'match_all': {}},
                    'script': {
                        'source': \"cosineSimilarity(params.query_vector, 'content_vector') + 1.0\",
                        'params': {'query_vector': query_vector}
                    }
                }
            },
            'size': limit
        }
        
        search_result = await self.es_client.search(
            index='projects',
            body=vector_query
        )
        
        return [hit['_source'] for hit in search_result['hits']['hits']]
```

## 📱 **Frontend Architecture Design**

### **Vue 3 + TypeScript Component Structure**
```typescript
// Main Application Architecture
interface ProjectKnowledgeBaseApp {
  // Core application state
  app_state: ApplicationStateManager;
  router: VueRouterConfiguration;
  store: PiniaStateStore;
  
  // Main UI components
  navigation: TabNavigationComponent;
  upload_interface: ProjectUploadComponent;
  database_browser: ProjectBrowserComponent;
  project_detail: ProjectDetailPageComponent;
  
  // AI integration components
  gbgreg_interface: ExistingGBGregComponent;
  search_interface: SmartSearchComponent;
  recommendation_engine: ProjectRecommendationComponent;
}

// Project Upload Component
export class ProjectUploadComponent extends Vue {
  // Upload state management
  private uploadState = reactive({
    files: [] as File[],
    uploading: false,
    progress: 0,
    validationResults: null as ValidationResult | null,
    processingStatus: 'idle' as 'idle' | 'uploading' | 'validating' | 'processing' | 'complete' | 'error'
  });
  
  // Drag and drop handling
  @Ref() private dropZone!: HTMLElement;
  
  mounted() {
    this.setupDragAndDrop();
  }
  
  private setupDragAndDrop() {
    const dropZone = this.dropZone;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.highlightDropZone, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.unhighlightDropZone, false);
    });
    
    dropZone.addEventListener('drop', this.handleDrop, false);
  }
  
  private async handleDrop(event: DragEvent) {
    const files = Array.from(event.dataTransfer?.files || []);
    await this.processFileUploads(files);
  }
  
  private async processFileUploads(files: File[]) {
    this.uploadState.uploading = true;
    this.uploadState.processingStatus = 'uploading';
    
    try {
      for (const file of files) {
        // Validate file before upload
        const validation = await this.validateFile(file);
        if (!validation.valid) {
          throw new Error(`File validation failed: ${validation.error}`);
        }
        
        // Upload with progress tracking
        const uploadResult = await this.uploadFileWithProgress(file);
        this.uploadState.validationResults = uploadResult.validation;
        
        // Process upload result
        if (uploadResult.success) {
          this.uploadState.processingStatus = 'processing';
          await this.pollProcessingStatus(uploadResult.project_id);
        }
      }
      
      this.uploadState.processingStatus = 'complete';
      
    } catch (error) {
      this.uploadState.processingStatus = 'error';
      console.error('Upload processing failed:', error);
    } finally {
      this.uploadState.uploading = false;
    }
  }
  
  private async uploadFileWithProgress(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('project_file', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          this.uploadState.progress = Math.round((event.loaded / event.total) * 100);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      
      xhr.open('POST', '/api/projects/upload');
      xhr.send(formData);
    });
  }
}

// Project Browser Component
export class ProjectBrowserComponent extends Vue {
  private browserState = reactive({
    projects: [] as Project[],
    loading: false,
    searchQuery: '',
    filters: {
      projectType: '',
      technologies: [] as string[],
      complexityRange: [1, 10] as [number, number]
    },
    sortBy: 'upload_timestamp' as 'upload_timestamp' | 'project_name' | 'complexity_score',
    sortOrder: 'desc' as 'asc' | 'desc',
    currentPage: 1,
    totalPages: 1
  });
  
  private searchDebounceTimer: number | null = null;
  
  @Watch('browserState.searchQuery')
  private onSearchQueryChange(newQuery: string) {
    // Debounce search to avoid excessive API calls
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    this.searchDebounceTimer = setTimeout(() => {
      this.performSearch();
    }, 300);
  }
  
  private async performSearch() {
    this.browserState.loading = true;
    
    try {
      const searchParams = {
        query: this.browserState.searchQuery,
        filters: this.browserState.filters,
        sort_by: this.browserState.sortBy,
        sort_order: this.browserState.sortOrder,
        page: this.browserState.currentPage,
        per_page: 20
      };
      
      const response = await fetch('/api/projects/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      
      const searchResult = await response.json();
      
      this.browserState.projects = searchResult.projects;
      this.browserState.totalPages = Math.ceil(searchResult.total_count / 20);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      this.browserState.loading = false;
    }
  }
  
  private async loadProjectDetail(projectId: string) {
    // Navigate to individual project page
    await this.$router.push(`/projects/${projectId}`);
  }
}
```

### **Responsive Design Implementation**
```css
/* Mobile-first responsive design for project knowledge base */
.project-knowledge-base {
  /* Base mobile styles */
  padding: 1rem;
  font-size: 16px;
  
  /* Upload interface mobile optimization */
  .upload-dropzone {
    min-height: 200px;
    border: 2px dashed #007bff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s ease;
    
    &.drag-over {
      border-color: #28a745;
      background-color: rgba(40, 167, 69, 0.1);
    }
  }
  
  /* Project grid responsive layout */
  .projects-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    .project-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      .project-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #212529;
      }
      
      .project-summary {
        font-size: 0.875rem;
        color: #6c757d;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .project-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
        
        .tech-tag {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }
      }
    }
  }
  
  /* Tablet optimization */
  @media (min-width: 768px) {
    padding: 2rem;
    
    .projects-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    .upload-dropzone {
      min-height: 300px;
    }
  }
  
  /* Desktop optimization */
  @media (min-width: 1024px) {
    .projects-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .project-detail-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      
      .main-content {
        .documentation-viewer {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
        }
      }
      
      .sidebar-content {
        .related-projects {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1.5rem;
        }
      }
    }
  }
  
  /* High-resolution displays */
  @media (min-width: 1440px) {
    .projects-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .project-knowledge-base {
    background-color: #121212;
    color: #e0e0e0;
    
    .project-card {
      background-color: #1e1e1e;
      border-color: #333;
      color: #e0e0e0;
      
      .project-title {
        color: #ffffff;
      }
      
      .project-summary {
        color: #b0b0b0;
      }
      
      .tech-tag {
        background-color: #333;
        color: #e0e0e0;
      }
    }
  }
}
```

---

**Project Knowledge Base System Architecture Status**: ✅ **COMPREHENSIVE** - Complete system design delivered with database schema, backend services, AI integration, and responsive frontend architecture ready for multi-thread implementation.

**Technical Architecture Readiness**: 🚀 **PRODUCTION-READY** - Scalable microservices design with PostgreSQL + Elasticsearch storage, DeepSeek AI integration, and Vue 3 + TypeScript frontend supporting desktop and mobile interfaces.