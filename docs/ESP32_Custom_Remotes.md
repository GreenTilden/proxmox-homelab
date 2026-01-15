# ESP32 Custom Family Remotes

**Status**: 📋 Planning
**Created**: January 2026
**Category**: IoT / Home Entertainment

---

## Overview

Custom-built ESP32 remotes for each family member, controlling:
- Retro gaming box (Pi/media PC)
- Plex/Kodi media playback
- Home Assistant (lights, scenes, etc.)
- Profile switching per user

Each remote has unique button layouts, clickable rotary dials, OLED displays, and automatic profile detection.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CUSTOM REMOTES                                │
├──────────────────┬──────────────────┬──────────────────┬─────────────┤
│    Remote A      │    Remote B      │    Remote C      │  Remote D   │
│    (Dad)         │    (Mom)         │    (Kid 1)       │  (Kid 2)    │
│  ┌──────────┐    │  ┌──────────┐    │  ┌──────────┐    │ ┌────────┐  │
│  │ Dial+OLED│    │  │ Simple   │    │  │ D-Pad    │    │ │Joystick│  │
│  │ Dev btns │    │  │ Big btns │    │  │ Game pad │    │ │Kid mode│  │
│  └──────────┘    │  └──────────┘    │  └──────────┘    │ └────────┘  │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴──────┬──────┘
         │                  │                  │                │
         └──────────────────┴────────┬─────────┴────────────────┘
                                     │ WiFi / MQTT
                                     ▼
                    ┌────────────────────────────────────┐
                    │      PROXMOX SERVER (192.168.0.99) │
                    ├────────────────────────────────────┤
                    │  Mosquitto MQTT Broker (port 1883) │
                    │  Home Assistant (port 8123)        │
                    └──────────────────┬─────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│  Retro Game Box │         │  Home Assistant  │         │    Plex/Kodi      │
│  (Raspberry Pi) │         │  (Lights/Scenes) │         │    (Media)        │
│                 │         │                  │         │                   │
│ - RetroArch     │         │ - Cync Lights    │         │ - Play/Pause      │
│ - Kodi          │         │ - TV Control     │         │ - Navigation      │
│ - EmulatorJS    │         │ - Scenes         │         │ - Search          │
└─────────────────┘         └──────────────────┘         └───────────────────┘
```

---

## Hardware

### Bill of Materials (Per Remote)

| Component | Description | Quantity | ~Cost | Link Reference |
|-----------|-------------|----------|-------|----------------|
| ESP32-S3 DevKit | Main MCU with WiFi/BLE | 1 | $6 | AliExpress/Amazon |
| EC11 Rotary Encoder | Clickable dial with detents | 1-2 | $2 | |
| Tactile Buttons 6x6mm | Standard pushbuttons | 8-12 | $1 | |
| SSD1306 OLED 0.96" | I2C display for status | 1 | $4 | |
| LiPo Battery 3.7V 1000mAh | Rechargeable power | 1 | $3 | |
| TP4056 USB-C Charging | Battery management | 1 | $1 | |
| Slide Switch | Power on/off | 1 | $0.50 | |
| 10K Resistors | Pull-ups/pull-downs | 5 | $0.25 | |
| Prototype PCB | 5x7cm or custom | 1 | $1 | |
| 3D Printed Case | Custom per remote | 1 | ~$2 filament | |
| **Total** | | | **~$20** | |

### Optional Upgrades

| Component | Use Case | Cost |
|-----------|----------|------|
| Analog Joystick | Kid gaming remote | $3 |
| Haptic Motor | Feedback on button press | $2 |
| WS2812B LED | RGB status indicator | $1 |
| Larger OLED 1.3" | Better visibility | $6 |
| Li-Ion 18650 + holder | Longer battery life | $4 |

---

## Schematic (Prototype Remote A - Dad)

```
                                    ┌─────────────────────────────────────┐
                                    │           ESP32-S3 DevKit           │
                                    │                                     │
     ┌──────────────┐               │  3V3 ○────────────────────○ GND     │
     │   SSD1306    │               │                                     │
     │   OLED       │◄──I2C────────▶│  GPIO21 (SDA) ────────────○ GPIO22 (SCL)
     │   128x64     │               │                                     │
     └──────────────┘               │  GPIO4  ○──────┐                    │
                                    │  GPIO5  ○──────┤ Rotary Encoder     │
     ┌──────────────┐               │  GPIO6  ○──────┘ (CLK/DT/SW)        │
     │   Rotary     │               │                                     │
     │   Encoder    │───────────────│  GPIO12 ○─── Button: Play/Pause     │
     │   (EC11)     │               │  GPIO13 ○─── Button: Menu           │
     │   Click+Turn │               │  GPIO14 ○─── Button: Back           │
     └──────────────┘               │  GPIO15 ○─── Button: Home           │
                                    │  GPIO16 ○─── Button: Up             │
     ┌──────────────┐               │  GPIO17 ○─── Button: Down           │
     │  Buttons     │               │  GPIO18 ○─── Button: Left           │
     │  (Tactile)   │───────────────│  GPIO19 ○─── Button: Right          │
     │              │               │  GPIO23 ○─── Button: Select         │
     └──────────────┘               │  GPIO25 ○─── Button: Function 1     │
                                    │  GPIO26 ○─── Button: Function 2     │
                                    │                                     │
     ┌──────────────┐               │  GPIO2  ○─── WS2812B Status LED     │
     │  TP4056      │               │                                     │
     │  USB-C       │───────────────│  5V     ○─── VIN (USB Power)        │
     │  Charger     │               │  GND    ○─── GND                    │
     └──────┬───────┘               │                                     │
            │                       └─────────────────────────────────────┘
     ┌──────┴───────┐
     │   LiPo       │
     │   3.7V       │
     │   1000mAh    │
     └──────────────┘


Button Wiring (each button):

    GPIO Pin ────┬──── 10K ──── 3V3
                 │
                 └──── Button ──── GND

    (Pull-up configuration, active LOW)
```

---

## MQTT Topic Structure

### Base Topics

```
homelab/remotes/                          # All remote traffic
├── {remote_id}/                          # Per-remote namespace
│   ├── status                            # Online/offline (LWT)
│   ├── battery                           # Battery percentage
│   ├── button/{button_name}              # Button events
│   ├── dial/rotation                     # Dial turn events
│   ├── dial/click                        # Dial click events
│   └── display/set                       # Commands TO the remote
│
├── active_remote                         # Which remote is currently active
└── command/                              # Outbound commands
    ├── media/{action}                    # Play, pause, next, etc.
    ├── games/{action}                    # Launch game, menu, etc.
    └── home/{action}                     # Lights, scenes, etc.
```

### Topic Examples

```yaml
# Button press from Dad remote
Topic: homelab/remotes/remote_dad/button/play_pause
Payload: {"state": "pressed", "timestamp": 1704931200}

# Dial rotation
Topic: homelab/remotes/remote_dad/dial/rotation
Payload: {"direction": "cw", "steps": 3}  # clockwise, 3 detents

# Dial click
Topic: homelab/remotes/remote_dad/dial/click
Payload: {"type": "single"}  # or "double", "hold"

# Battery status
Topic: homelab/remotes/remote_dad/battery
Payload: {"level": 85, "charging": false}

# Set display content (from server)
Topic: homelab/remotes/remote_dad/display/set
Payload: {"line1": "Plex", "line2": "The Office S03E12", "icon": "play"}

# Active remote changed
Topic: homelab/remotes/active_remote
Payload: {"remote_id": "remote_dad", "profile": "dad"}
```

### Command Topics (Server → Devices)

```yaml
# Media control
homelab/command/media/play
homelab/command/media/pause
homelab/command/media/next
homelab/command/media/prev
homelab/command/media/volume     # Payload: {"level": 75} or {"delta": 5}

# Game control
homelab/command/games/launch     # Payload: {"system": "snes", "game": "mario"}
homelab/command/games/menu
homelab/command/games/save_state
homelab/command/games/load_state

# Home control (forwarded to Home Assistant)
homelab/command/home/lights      # Payload: {"room": "living", "state": "on"}
homelab/command/home/scene       # Payload: {"name": "movie_mode"}
```

---

## ESPHome Configuration

### Remote A (Dad) - Full Featured Prototype

```yaml
# File: esp32-remote-dad.yaml
# Dad's remote - Full featured with dial, OLED, all buttons

esphome:
  name: remote-dad
  friendly_name: "Dad Remote"

esp32:
  board: esp32-s3-devkitc-1
  framework:
    type: arduino

# Enable logging
logger:
  level: INFO

# Enable Home Assistant API
api:
  encryption:
    key: !secret api_encryption_key

# Enable OTA updates
ota:
  password: !secret ota_password

# WiFi configuration
wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

  # Enable fallback hotspot
  ap:
    ssid: "Remote-Dad-Fallback"
    password: !secret ap_password

# MQTT for direct device communication
mqtt:
  broker: 192.168.0.99
  port: 1883
  username: !secret mqtt_user
  password: !secret mqtt_password
  topic_prefix: homelab/remotes/remote_dad

  # Last Will and Testament
  birth_message:
    topic: homelab/remotes/remote_dad/status
    payload: "online"
  will_message:
    topic: homelab/remotes/remote_dad/status
    payload: "offline"

# I2C for OLED display
i2c:
  sda: GPIO21
  scl: GPIO22
  scan: true

# OLED Display
display:
  - platform: ssd1306_i2c
    model: "SSD1306 128x64"
    id: oled_display
    address: 0x3C
    lambda: |-
      it.printf(0, 0, id(font_medium), "Remote: Dad");
      it.printf(0, 20, id(font_small), "%s", id(display_line1).c_str());
      it.printf(0, 35, id(font_small), "%s", id(display_line2).c_str());
      it.printf(0, 50, id(font_tiny), "Batt: %.0f%%", id(battery_level).state);

font:
  - file: "gfonts://Roboto"
    id: font_medium
    size: 14
  - file: "gfonts://Roboto"
    id: font_small
    size: 12
  - file: "gfonts://Roboto"
    id: font_tiny
    size: 10

# Global variables for display
globals:
  - id: display_line1
    type: std::string
    initial_value: '"Ready"'
  - id: display_line2
    type: std::string
    initial_value: '""'

# Text sensors for MQTT display updates
text_sensor:
  - platform: mqtt_subscribe
    id: mqtt_display_line1
    topic: homelab/remotes/remote_dad/display/line1
    on_value:
      then:
        - lambda: 'id(display_line1) = x;'

  - platform: mqtt_subscribe
    id: mqtt_display_line2
    topic: homelab/remotes/remote_dad/display/line2
    on_value:
      then:
        - lambda: 'id(display_line2) = x;'

# Battery monitoring (voltage divider on GPIO35)
sensor:
  - platform: adc
    pin: GPIO35
    name: "Battery Voltage"
    id: battery_voltage
    update_interval: 60s
    attenuation: 11db
    filters:
      - multiply: 2  # Voltage divider ratio

  - platform: template
    name: "Battery Level"
    id: battery_level
    unit_of_measurement: "%"
    update_interval: 60s
    lambda: |-
      float voltage = id(battery_voltage).state;
      float percentage = (voltage - 3.2) / (4.2 - 3.2) * 100;
      if (percentage > 100) percentage = 100;
      if (percentage < 0) percentage = 0;
      return percentage;

# Rotary Encoder (Clickable Dial)
  - platform: rotary_encoder
    name: "Dial Position"
    id: dial
    pin_a: GPIO4
    pin_b: GPIO5
    resolution: 1
    on_clockwise:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/dial/rotation
          payload: '{"direction": "cw", "steps": 1}'
      - mqtt.publish:
          topic: homelab/command/media/volume
          payload: '{"delta": 2}'
    on_anticlockwise:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/dial/rotation
          payload: '{"direction": "ccw", "steps": 1}'
      - mqtt.publish:
          topic: homelab/command/media/volume
          payload: '{"delta": -2}'

# Dial Click Button
binary_sensor:
  - platform: gpio
    pin:
      number: GPIO6
      mode: INPUT_PULLUP
      inverted: true
    name: "Dial Click"
    id: dial_click
    on_click:
      min_length: 50ms
      max_length: 500ms
      then:
        - mqtt.publish:
            topic: homelab/remotes/remote_dad/dial/click
            payload: '{"type": "single"}'
        - mqtt.publish:
            topic: homelab/command/media/play_pause
            payload: "toggle"
    on_double_click:
      min_length: 50ms
      max_length: 300ms
      then:
        - mqtt.publish:
            topic: homelab/remotes/remote_dad/dial/click
            payload: '{"type": "double"}'
        - mqtt.publish:
            topic: homelab/command/media/mute
            payload: "toggle"
    on_multi_click:
      - timing:
          - ON for at least 1s
        then:
          - mqtt.publish:
              topic: homelab/remotes/remote_dad/dial/click
              payload: '{"type": "hold"}'
          - mqtt.publish:
              topic: homelab/command/home/scene
              payload: '{"name": "movie_mode"}'

  # Navigation Buttons
  - platform: gpio
    pin:
      number: GPIO16
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Up"
    on_press:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/button/up
          payload: "pressed"
      - mqtt.publish:
          topic: homelab/command/media/navigate
          payload: "up"

  - platform: gpio
    pin:
      number: GPIO17
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Down"
    on_press:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/button/down
          payload: "pressed"
      - mqtt.publish:
          topic: homelab/command/media/navigate
          payload: "down"

  - platform: gpio
    pin:
      number: GPIO18
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Left"
    on_press:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/button/left
          payload: "pressed"
      - mqtt.publish:
          topic: homelab/command/media/navigate
          payload: "left"

  - platform: gpio
    pin:
      number: GPIO19
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Right"
    on_press:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/button/right
          payload: "pressed"
      - mqtt.publish:
          topic: homelab/command/media/navigate
          payload: "right"

  - platform: gpio
    pin:
      number: GPIO23
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Select"
    on_press:
      - mqtt.publish:
          topic: homelab/remotes/remote_dad/button/select
          payload: "pressed"
      - mqtt.publish:
          topic: homelab/command/media/select
          payload: "confirm"

  # Function Buttons
  - platform: gpio
    pin:
      number: GPIO12
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Play/Pause"
    on_press:
      - mqtt.publish:
          topic: homelab/command/media/play_pause
          payload: "toggle"

  - platform: gpio
    pin:
      number: GPIO13
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Menu"
    on_press:
      - mqtt.publish:
          topic: homelab/command/media/menu
          payload: "open"

  - platform: gpio
    pin:
      number: GPIO14
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Back"
    on_press:
      - mqtt.publish:
          topic: homelab/command/media/back
          payload: "back"

  - platform: gpio
    pin:
      number: GPIO15
      mode: INPUT_PULLUP
      inverted: true
    name: "Button Home"
    on_press:
      - mqtt.publish:
          topic: homelab/command/media/home
          payload: "home"

  - platform: gpio
    pin:
      number: GPIO25
      mode: INPUT_PULLUP
      inverted: true
    name: "Function 1 - Retro Games"
    on_press:
      - mqtt.publish:
          topic: homelab/command/games/menu
          payload: "open"

  - platform: gpio
    pin:
      number: GPIO26
      mode: INPUT_PULLUP
      inverted: true
    name: "Function 2 - Plex"
    on_press:
      - mqtt.publish:
          topic: homelab/command/media/launch
          payload: '{"app": "plex"}'
```

### secrets.yaml (for ESPHome)

```yaml
# File: secrets.yaml
wifi_ssid: "YourWiFiSSID"
wifi_password: "YourWiFiPassword"
api_encryption_key: "generate-a-32-byte-base64-key"
ota_password: "ota-password-here"
ap_password: "fallback-ap-password"
mqtt_user: "mqtt_user"
mqtt_password: "mqtt_password"
```

---

## Remote Variations

### Remote B (Mom) - Simplified

```yaml
# Differences from Remote A:
# - Fewer buttons (just essentials)
# - Larger button targets
# - No dial (or simplified dial for volume only)
# - Bigger OLED text

# Button layout:
# [  POWER  ]
# [ < ] [OK] [ > ]
# [PLAY/PAUSE]
# [  PLEX  ] [NETFLIX]
```

### Remote C (Kid 1) - Gaming Focused

```yaml
# Differences:
# - D-pad layout (like game controller)
# - A/B/X/Y style buttons
# - No settings access
# - Profile locked to kid content
# - Bright colored case

# Button layout:
#        [UP]
#  [LEFT][OK][RIGHT]
#       [DOWN]
#    [A]    [B]
#    [START][SELECT]
```

### Remote D (Kid 2) - Joystick Version

```yaml
# Differences:
# - Analog joystick instead of D-pad
# - Haptic feedback on inputs
# - Different color scheme
# - Age-appropriate restrictions

# Hardware change:
# Replace D-pad buttons with:
# - Analog joystick module (2-axis + click)
# - GPIO34 (ADC) for X axis
# - GPIO39 (ADC) for Y axis
```

---

## Server-Side Setup

### 1. Install Mosquitto MQTT Broker

```bash
# On Proxmox (192.168.0.99)
apt update && apt install -y mosquitto mosquitto-clients

# Configure authentication
mosquitto_passwd -c /etc/mosquitto/passwd mqtt_user

# Create config
cat > /etc/mosquitto/conf.d/custom.conf << 'EOF'
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
EOF

# Restart
systemctl restart mosquitto
systemctl enable mosquitto
```

### 2. Home Assistant MQTT Integration

```yaml
# In Home Assistant configuration.yaml
mqtt:
  broker: 192.168.0.99
  port: 1883
  username: mqtt_user
  password: !secret mqtt_password

# Automation example: Movie mode when dial held
automation:
  - alias: "Remote - Movie Mode"
    trigger:
      platform: mqtt
      topic: "homelab/command/home/scene"
    condition:
      condition: template
      value_template: "{{ trigger.payload_json.name == 'movie_mode' }}"
    action:
      - service: scene.turn_on
        entity_id: scene.movie_mode
```

### 3. MQTT to Kodi/Plex Bridge

```python
#!/usr/bin/env python3
"""
mqtt_media_bridge.py
Bridges MQTT commands to Kodi/Plex on the media box
Run on the Raspberry Pi media box
"""

import paho.mqtt.client as mqtt
import requests
import json

MQTT_BROKER = "192.168.0.99"
KODI_HOST = "localhost"
KODI_PORT = 8080

def send_kodi(method, params=None):
    """Send JSON-RPC command to Kodi"""
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params or {},
        "id": 1
    }
    try:
        r = requests.post(
            f"http://{KODI_HOST}:{KODI_PORT}/jsonrpc",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        return r.json()
    except Exception as e:
        print(f"Kodi error: {e}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()

    # Media controls
    if topic == "homelab/command/media/play_pause":
        send_kodi("Player.PlayPause", {"playerid": 1})

    elif topic == "homelab/command/media/navigate":
        direction_map = {
            "up": "Input.Up",
            "down": "Input.Down",
            "left": "Input.Left",
            "right": "Input.Right"
        }
        if payload in direction_map:
            send_kodi(direction_map[payload])

    elif topic == "homelab/command/media/select":
        send_kodi("Input.Select")

    elif topic == "homelab/command/media/back":
        send_kodi("Input.Back")

    elif topic == "homelab/command/media/home":
        send_kodi("Input.Home")

    elif topic == "homelab/command/media/volume":
        try:
            data = json.loads(payload)
            if "delta" in data:
                result = send_kodi("Application.GetProperties",
                                   {"properties": ["volume"]})
                current = result.get("result", {}).get("volume", 50)
                new_vol = max(0, min(100, current + data["delta"]))
                send_kodi("Application.SetVolume", {"volume": new_vol})
        except:
            pass

def main():
    client = mqtt.Client()
    client.username_pw_set("mqtt_user", "mqtt_password")
    client.on_message = on_message

    client.connect(MQTT_BROKER, 1883, 60)
    client.subscribe("homelab/command/media/#")
    client.subscribe("homelab/command/games/#")

    print("MQTT Media Bridge running...")
    client.loop_forever()

if __name__ == "__main__":
    main()
```

---

## 3D Printed Enclosure

### Design Considerations

- **Ergonomic grip** - Comfortable one-handed use
- **Button access** - Easy to press without looking
- **Dial placement** - Thumb accessible at top
- **OLED window** - Clear acrylic or open cutout
- **USB-C port** - Accessible for charging
- **Battery compartment** - Easy to replace if needed
- **Personalization** - Different colors per family member

### Recommended Tools

- **Fusion 360** or **TinkerCAD** for design
- **Cura** or **PrusaSlicer** for slicing
- **PLA or PETG** filament
- Consider **TPU** for button caps (softer feel)

### Reference Dimensions

```
Overall: 140mm x 60mm x 25mm
Dial hole: 7mm diameter
Button holes: 6.5mm diameter
OLED window: 28mm x 15mm
USB-C port: 9mm x 3.5mm
```

---

## Implementation Phases

### Phase 1: Prototype
- [ ] Order components for one remote
- [ ] Set up Mosquitto on Proxmox
- [ ] Flash ESPHome to ESP32
- [ ] Test basic button → MQTT → action flow
- [ ] Breadboard prototype

### Phase 2: Software Integration
- [ ] Configure Home Assistant MQTT
- [ ] Set up media box (Pi) with Kodi
- [ ] Deploy MQTT bridge script
- [ ] Test end-to-end: button press → media action

### Phase 3: Hardware Refinement
- [ ] Design PCB layout (or perfboard)
- [ ] Design 3D printed case
- [ ] Assemble first complete remote
- [ ] Battery life testing

### Phase 4: Family Rollout
- [ ] Build Remote B (Mom)
- [ ] Build Remote C (Kid 1)
- [ ] Build Remote D (Kid 2)
- [ ] Profile switching automation
- [ ] Documentation for family

---

## Parts Shopping List

### Amazon/Adafruit (Fast shipping)
- ESP32-S3 DevKitC-1
- SSD1306 OLED 0.96"
- EC11 Rotary Encoders (5 pack)

### AliExpress (Cheaper, slower)
- Tactile buttons assortment
- TP4056 USB-C charging boards
- LiPo batteries 1000mAh
- Prototype PCBs

### 3D Printing
- PLA filament (multiple colors)
- Clear acrylic sheet (OLED windows)

---

## Links & Resources

- [[Services]] - Home Assistant, MQTT broker locations
- [[Smart Home]] - Existing Cync light setup
- [[Homelab Overview]] - Network topology
- ESPHome Docs: https://esphome.io/
- Kodi JSON-RPC: https://kodi.wiki/view/JSON-RPC_API

---

## Notes

- Test battery life before finalizing case design
- Consider adding NFC tag in each remote for identification
- Future: voice commands via onboard mic?
- Future: IR blaster for legacy TV control?

---

*Last updated: January 2026*
