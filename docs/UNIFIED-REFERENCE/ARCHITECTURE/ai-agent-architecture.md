# AI Agent Architecture - DeepSeek Coder Integration Framework

**Created**: 2025-08-26  
**Purpose**: Comprehensive AI infrastructure architecture for laboratory automation code generation with RTX 5070 Ti optimization

## 🤖 **AI Stack Overview**

### **Core Architecture**
```
├── DeepSeek Coder 6.7B (Primary AI Model)
├── RTX 5070 Ti GPU (16GB VRAM - Hardware Acceleration)
├── Container Environment (CT 120 - 4 cores, 8GB RAM)
├── PostgreSQL Database (gbgreg_db - Pattern Storage)
├── Ollama Inference Server (Model Management)
├── Screenshot Analysis Pipeline (OCR + Pattern Recognition)
└── Safety Validation Engine (C# 4.0 Compliance)
```

### **Performance Baseline**
- **DeepSeek Coder Response Time**: 24-second baseline for code generation
- **GPU Utilization**: Full 16GB VRAM access with CUDA 12.9
- **Container Resource Allocation**: 4 cores, 8GB RAM with GPU passthrough
- **Concurrent User Support**: Designed for 5+ simultaneous sessions

## 🏗️ **Infrastructure Foundation**

### **RTX 5070 Ti GPU Integration**

#### **Hardware Configuration**
```yaml
GPU_Specifications:
  Model: NVIDIA GeForce RTX 5070 Ti
  Architecture: Blackwell GB203
  VRAM: 16GB GDDR7
  CUDA_Cores: 8960
  Driver: 575.64.05 (Blackwell compatible)
  CUDA_Version: 12.9
  
Performance_Optimization:
  Memory_Access: Full 16GB VRAM available
  PCIe_Slot: Secondary x16 slot (primary reserved for LSI HBA)
  Power_Management: 750W PSU adequate for full utilization
  Cooling: Monitored via NVIDIA exporter (Port 9105)
```

#### **GPU Resource Allocation Strategy**
```bash
# GPU allocation for AI workloads
# Primary allocation: DeepSeek Coder inference
nvidia-smi -L  # Verify GPU visibility
docker run --gpus all --name deepseek-coder ollama/ollama:latest

# Memory management for large models
GPU_MEMORY_ALLOCATION:
  DeepSeek_6.7B: ~8GB VRAM (50% utilization)
  Screenshot_Analysis: ~2GB VRAM (OCR models)
  Safety_Validation: ~1GB VRAM (constraint checking)
  Available_Buffer: ~5GB VRAM (concurrent operations)
```

### **Container Orchestration**

#### **CT 120 Specifications**
```yaml
Container_Configuration:
  Type: Proxmox LXC Container
  CPU_Cores: 4 (dedicated allocation)
  Memory: 8GB RAM
  Storage: /service-pool/gbgreg/ (SSD performance)
  GPU_Access: RTX 5070 Ti passthrough
  Network: 172.20.0.0/24 (AI network isolation)
  
Mount_Points:
  - /service-pool/gbgreg:/app/data
  - /staging-pool/screenshots:/app/screenshots
  - /media-pool/ai-models:/app/models
```

#### **Service Deployment Architecture**
```yaml
AI_Services_Stack:
  ollama:
    image: ollama/ollama:latest
    container_name: gbgreg-ollama
    ports: ["11434:11434"]
    gpu_access: true
    models: ["deepseek-coder:6.7b"]
    
  chatbot-ui:
    image: ghcr.io/open-webui/open-webui:latest
    container_name: gbgreg-ui
    ports: ["3002:8080"]
    environment:
      OLLAMA_BASE_URL: "http://ollama:11434"
      
  code-server:
    image: linuxserver/code-server:latest
    container_name: gbgreg-ide
    ports: ["8443:8443"]
    volumes:
      - "/service-pool/gbgreg/workspace:/config/workspace"
```

## 🧠 **DeepSeek Coder Integration**

### **Model Deployment & Configuration**

#### **DeepSeek Coder 6.7B Optimization**
```bash
# Model deployment with GPU acceleration
ollama pull deepseek-coder:6.7b-instruct

# GPU memory optimization
export OLLAMA_GPU_LAYERS=35  # Optimize for 16GB VRAM
export OLLAMA_NUM_PARALLEL=2  # Concurrent inference sessions
export OLLAMA_MAX_LOADED_MODELS=1  # Memory conservation

# Performance tuning for laboratory automation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder:6.7b-instruct",
    "prompt": "Generate C# 4.0 compatible code for laboratory automation",
    "options": {
      "temperature": 0.2,
      "top_p": 0.8,
      "max_tokens": 2048,
      "stop": ["```", "//END"]
    }
  }'
```

#### **Model Performance Characteristics**
```yaml
DeepSeek_Coder_Metrics:
  Baseline_Response_Time: 24 seconds
  Code_Generation_Quality: High accuracy for C# patterns
  C#_4.0_Compatibility: Requires validation pipeline
  Laboratory_Context_Understanding: Good with proper prompting
  
Optimization_Targets:
  Response_Time: <5 seconds (GPU acceleration goal)
  Code_Accuracy: >90% C# 4.0 compliance
  Safety_Compliance: 100% constraint validation
  Context_Retention: Multi-turn conversation support
```

### **AI Prompt Engineering Framework**

#### **Laboratory Automation Prompt Templates**
```csharp
public class GBGPromptTemplate
{
    public static string GenerateCodePrompt(string userRequest)
    {
        return $@"
You are a laboratory automation expert generating C# 4.0 compatible code for Biosero Green Button Go.

CRITICAL CONSTRAINTS:
- C# 4.0 syntax only (no async/await, no dynamic, no optional parameters without defaults)
- Synchronous operations only for equipment safety
- Explicit error handling with equipment state logging
- Named parameters for laboratory operation clarity
- No exception swallowing - all errors must be handled explicitly

USER REQUEST: {userRequest}

SAFETY REQUIREMENTS:
- Validate all parameters before equipment operations
- Include timeout protection for long operations
- Verify equipment state before and after operations
- Log all equipment interactions for audit trail

Generate safe, compliant C# 4.0 code with comprehensive error handling:

```csharp
";
    }
    
    public static string AnalyzeScreenshotPrompt(string ocrText, byte[] imageData)
    {
        return $@"
Analyze this Biosero Green Button Go interface screenshot.

OCR_TEXT_EXTRACTED: {ocrText}

IDENTIFY:
1. Current workflow step or dialog
2. Required user input fields
3. Button/control elements visible
4. Error messages or warnings
5. Workflow state (running/stopped/error)

GENERATE C# 4.0 code suggestions for:
- Data entry automation
- Workflow step execution  
- Error handling for detected issues
- Parameter validation for visible controls

Focus on safe, synchronous operations with explicit error handling.
";
    }
}
```

## 📸 **Screenshot Analysis Pipeline**

### **OCR & Pattern Recognition**

#### **Image Processing Workflow**
```python
# Screenshot analysis pipeline architecture
class ScreenshotAnalyzer:
    def __init__(self):
        self.ocr_engine = EasyOCR(['en'])  # GPU-accelerated OCR
        self.pattern_classifier = GBGPatternClassifier()
        self.confidence_threshold = 0.7
        
    def analyze_screenshot(self, image_path):
        """Complete screenshot analysis pipeline"""
        
        # Step 1: OCR text extraction
        ocr_results = self.ocr_engine.readtext(image_path)
        text_content = self.extract_text_content(ocr_results)
        
        # Step 2: UI element detection
        ui_elements = self.detect_ui_elements(image_path)
        
        # Step 3: Workflow state classification
        workflow_state = self.classify_workflow_state(text_content, ui_elements)
        
        # Step 4: Generate code suggestions
        suggestions = self.generate_code_suggestions(workflow_state)
        
        return AnalysisResult(
            text_content=text_content,
            ui_elements=ui_elements,
            workflow_state=workflow_state,
            code_suggestions=suggestions,
            confidence_score=self.calculate_confidence(suggestions)
        )
```

#### **GBG-Specific Pattern Recognition**
```python
class GBGPatternClassifier:
    """Biosero Green Button Go specific pattern recognition"""
    
    def __init__(self):
        self.patterns = {
            'dialog_box': ['OK', 'Cancel', 'Apply', 'Close'],
            'parameter_input': ['Parameter', 'Value', 'Units', 'Range'],
            'workflow_control': ['Start', 'Stop', 'Pause', 'Reset'],
            'error_state': ['Error', 'Warning', 'Failed', 'Exception'],
            'data_entry': ['Source', 'Destination', 'Volume', 'Temperature']
        }
        
    def classify_interface_state(self, text_content, ui_elements):
        """Identify current GBG interface state"""
        
        state_scores = {}
        
        for pattern_type, keywords in self.patterns.items():
            score = sum(1 for keyword in keywords 
                       if keyword.lower() in text_content.lower())
            state_scores[pattern_type] = score
            
        # Determine primary interface state
        primary_state = max(state_scores, key=state_scores.get)
        confidence = state_scores[primary_state] / len(self.patterns[primary_state])
        
        return InterfaceState(
            state_type=primary_state,
            confidence=confidence,
            detected_elements=ui_elements
        )
```

### **Real-time Processing Integration**

#### **Screenshot Processing Service**
```yaml
Screenshot_Service_Architecture:
  Input: User screenshot upload or screen capture
  Processing_Pipeline:
    1. Image preprocessing (resolution, clarity enhancement)
    2. OCR text extraction with confidence scoring
    3. UI element detection and classification
    4. GBG workflow state identification
    5. C# 4.0 code generation with safety validation
  Output: Validated code suggestions with confidence metrics
  
Performance_Targets:
  Processing_Time: <5 seconds end-to-end
  OCR_Accuracy: >95% for GBG interface text
  Pattern_Recognition: >80% workflow state accuracy
  Code_Generation: 100% C# 4.0 compliance
```

## 🗄️ **Knowledge Base Architecture**

### **PostgreSQL Database Design**

#### **ScriptDB Pattern Integration**
```sql
CREATE DATABASE gbgreg_db;

-- Pattern storage from ScriptDB migration
CREATE TABLE automation_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    csharp_template TEXT NOT NULL,
    safety_constraints JSONB,
    usage_examples TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Screenshot analysis results
CREATE TABLE screenshot_analysis (
    id SERIAL PRIMARY KEY,
    image_hash VARCHAR(64) UNIQUE,
    ocr_text TEXT,
    ui_elements JSONB,
    workflow_state VARCHAR(100),
    confidence_score DECIMAL(3,2),
    generated_code TEXT,
    validation_results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User feedback for continuous improvement
CREATE TABLE suggestion_feedback (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES screenshot_analysis(id),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    code_accuracy_rating INTEGER CHECK (code_accuracy_rating BETWEEN 1 AND 5),
    safety_compliance BOOLEAN,
    user_comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Pattern Migration Strategy**
```python
class ScriptDBMigration:
    
    def migrate_patterns(self):
        """Convert Vue 3 + TypeScript patterns to C# 4.0"""
        
        scriptdb_patterns = self.load_scriptdb_patterns()
        
        for pattern in scriptdb_patterns:
            # Convert TypeScript to C# 4.0 equivalent
            csharp_code = self.convert_typescript_to_csharp(pattern.code)
            
            # Apply safety constraints
            safe_code = self.apply_safety_constraints(csharp_code)
            
            # Validate C# 4.0 compliance
            validation_result = self.validate_csharp_40(safe_code)
            
            if validation_result.is_valid:
                # Store migrated pattern
                self.store_automation_pattern(
                    name=pattern.name,
                    category=pattern.category,
                    csharp_template=safe_code,
                    safety_constraints=validation_result.constraints
                )
```

## 📊 **Monitoring & Performance**

### **AI-Specific Metrics Collection**

#### **Grafana Dashboard Integration**
```yaml
AI_Metrics_Dashboard:
  GPU_Utilization:
    - NVIDIA GPU memory usage (Port 9105)
    - CUDA core utilization percentage
    - Temperature monitoring and thermal throttling
    
  Model_Performance:
    - DeepSeek Coder response times
    - Code generation success rate
    - C# 4.0 compliance percentage
    - Safety validation pass/fail rates
    
  User_Interaction:
    - Screenshot analysis requests per hour
    - User feedback ratings (1-5 scale)
    - Code suggestion acceptance rate
    - Error/retry frequencies
    
  System_Resources:
    - Container CPU usage (CT 120)
    - Memory allocation and swap usage
    - Storage I/O for model operations
    - Network throughput for API requests
```

#### **Performance Alerting**
```yaml
Alert_Thresholds:
  Critical_Alerts:
    - GPU temperature >85°C
    - Model response time >60 seconds
    - C# 4.0 validation failure rate >5%
    - System memory usage >90%
    
  Warning_Alerts:
    - GPU utilization <30% (underutilization)
    - Code suggestion confidence <70%
    - User feedback rating <3.0
    - Screenshot processing >10 seconds
```

## 🔄 **Continuous Improvement Framework**

### **Model Fine-tuning Pipeline**

#### **Feedback Integration**
```python
class ModelImprovement:
    """Continuous model improvement based on user feedback"""
    
    def collect_training_data(self):
        """Collect successful code generations for model fine-tuning"""
        
        successful_generations = self.db.query("""
            SELECT sa.generated_code, sf.user_rating
            FROM screenshot_analysis sa
            JOIN suggestion_feedback sf ON sa.id = sf.analysis_id
            WHERE sf.code_accuracy_rating >= 4
            AND sf.safety_compliance = true
            ORDER BY sa.created_at DESC
        """)
        
        return successful_generations
    
    def generate_fine_tuning_dataset(self):
        """Create dataset for DeepSeek Coder improvement"""
        
        training_data = self.collect_training_data()
        
        # Format for fine-tuning
        dataset = []
        for example in training_data:
            dataset.append({
                "instruction": "Generate safe C# 4.0 laboratory automation code",
                "input": example.screenshot_context,
                "output": example.generated_code,
                "safety_validated": True
            })
            
        return dataset
```

### **Safety Validation Enhancement**

#### **Constraint Learning**
```python
class SafetyConstraintLearning:
    """Learn new safety patterns from user corrections"""
    
    def analyze_user_corrections(self):
        """Identify common safety issues from user feedback"""
        
        corrections = self.db.query("""
            SELECT original_code, corrected_code, safety_issue
            FROM user_corrections
            WHERE safety_compliance_improved = true
        """)
        
        # Extract new constraint patterns
        new_patterns = []
        for correction in corrections:
            pattern = self.extract_safety_pattern(
                correction.original_code,
                correction.corrected_code,
                correction.safety_issue
            )
            new_patterns.append(pattern)
            
        return new_patterns
    
    def update_validation_rules(self, new_patterns):
        """Add learned patterns to safety validation"""
        
        for pattern in new_patterns:
            self.add_validation_rule(
                name=pattern.name,
                description=pattern.description,
                regex_pattern=pattern.regex,
                severity=pattern.severity
            )
```

---

**AI Agent Architecture Status**: ✅ **COMPREHENSIVE** - Complete DeepSeek Coder integration with RTX 5070 Ti optimization, screenshot analysis pipeline, and safety validation framework ready for production laboratory automation development.