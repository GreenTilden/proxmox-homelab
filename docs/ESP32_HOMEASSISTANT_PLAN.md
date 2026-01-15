# ESP32 + Home Assistant Project Plan

## Hardware Shopping List

### Already Ordered
- ELEGOO ESP32 3-pack (USB-C, WiFi+Bluetooth)

### To Order

**Essentials:**
| Item | ~Price | Notes |
|------|--------|-------|
| Jumper wires (male-to-female) | $6 | Connects sensors to ESP32 |
| Breadboard | $5 | For prototyping without soldering |
| USB-C cable | $7 | For flashing/power |

**Motion Sensor Project:**
| Item | ~Price | Notes |
|------|--------|-------|
| HC-SR501 PIR sensor (3-pack) | $6 | Motion detection |

**Temperature/Humidity Project:**
| Item | ~Price | Notes |
|------|--------|-------|
| DHT22 sensor (3-pack) | $10 | Climate monitoring |

**Nice to Have:**
| Item | ~Price | Notes |
|------|--------|-------|
| Door/window reed switches (10-pack) | $8 | Magnetic sensors |
| Light sensor BH1750 | $6 | Ambient light detection |
| 5V relay module (2-pack) | $7 | Control dumb devices |
| Mini project boxes | $8 | Enclosures |

## Integration Method

### Option A: ESPHome (Recommended for HA)
- YAML configuration
- Auto-discovery in Home Assistant
- OTA updates
- No coding required

### Option B: Arduino/Manual (Learning)
- C++ with Arduino IDE
- Full control over logic
- MQTT to communicate with HA
- More educational

## Project Ideas

1. **Motion-activated basement lights** - PIR sensor triggers HA automation
2. **Climate monitoring** - DHT22 sensors in each room, dashboard in HA
3. **Door/window sensors** - Reed switches for security notifications
4. **Ambient light sensor** - Auto-adjust lights based on natural light
5. **IR blaster** - Control TV/AC through HA

## Home Assistant Setup

- ESPHome add-on installed
- Home Assistant: http://192.168.0.99:8123
- Dashboard: http://192.168.0.250

## Weather Lighting Automation

Already configured with:
- light.above_desk
- light.shower_light
- light.basement_light_1 through light.basement_light_8

Weather conditions mapped to brightness/color settings with rain flicker effect.
