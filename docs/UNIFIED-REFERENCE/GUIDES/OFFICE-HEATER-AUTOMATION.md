# Office Space Heater Automation

Automated space heater control using ESP32 sensors, SwitchBot Bot, and Home Assistant.

## Overview

An ESP32 in the office acts as a sensor node (temperature, motion, button) and BLE proxy. Home Assistant reads the sensors and sends commands to a SwitchBot Bot, which physically presses the heater's power button.

```
[PIR Sensor] ──┐
[Temp Sensor] ──┼── [ESP32] ──WiFi──> [Home Assistant]
[Button] ───────┘       │
                        └──BLE──> [SwitchBot Bot] ──press──> [Space Heater]
```

---

## Shopping List

### Already Have
- ESP32 dev board (confirm it has USB-C or micro-USB for power)
- PIR motion sensor

### Need to Buy

| Item | Example Part | Approx Price | Notes |
|------|-------------|-------------|-------|
| SwitchBot Bot | SwitchBot Bot (S1) | ~$30 | The finger-press actuator. Buy from SwitchBot or Amazon |
| DHT22 temp/humidity sensor | DHT22 module (3-pin breakout) | ~$5-8 | Pre-mounted on breakout board with pull-up resistor |
| Momentary push button | 12mm tactile button | ~$1-2 | Any normally-open momentary switch works |
| Jumper wires (F-F and M-F) | Dupont wires | ~$3-5 | For connecting sensors to ESP32 |
| Breadboard (optional) | Half-size breadboard | ~$3-5 | For prototyping; can solder direct later |
| USB power supply | Any 5V/1A+ phone charger | ~$0 | Use one you already have |
| USB cable | Matching your ESP32 port | ~$0 | Use one you already have |

**Estimated total: ~$40-50**

---

## Wiring

### Pin Assignments

| Component | ESP32 Pin | Notes |
|-----------|-----------|-------|
| DHT22 Data | GPIO 4 | |
| DHT22 VCC | 3.3V | |
| DHT22 GND | GND | |
| PIR Signal | GPIO 14 | |
| PIR VCC | 3.3V (or VIN/5V depending on your PIR) | Check your PIR module voltage |
| PIR GND | GND | |
| Button Pin 1 | GPIO 27 | |
| Button Pin 2 | GND | Uses internal pull-up resistor |

### Wiring Steps

1. **DHT22**: Connect VCC to 3.3V, GND to GND, Data to GPIO 4.
2. **PIR sensor**: Connect VCC to 3.3V (or 5V if your module requires it - check the label), GND to GND, Signal to GPIO 14.
3. **Button**: Connect one leg to GPIO 27, the other leg to GND.
4. **Power**: Plug USB cable into the ESP32 and into your USB power supply.

---

## Software Setup

### 1. Install ESPHome

If you don't have ESPHome yet, install it as a Home Assistant add-on:

1. In Home Assistant, go to **Settings > Add-ons > Add-on Store**
2. Search for **ESPHome** and install it
3. Start the add-on and open the web UI

### 2. Flash the ESP32

Create a new device in the ESPHome dashboard and use the following YAML config.

### 3. ESPHome Configuration

```yaml
esphome:
  name: office-heater-sensors
  friendly_name: Office Heater Sensors

esp32:
  board: esp32dev

# Enable logging
logger:

# Enable Home Assistant API
api:
  encryption:
    key: !secret api_encryption_key

ota:
  - platform: esphome
    password: !secret ota_password

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

  # Fallback hotspot in case WiFi fails
  ap:
    ssid: "Office-Sensors-Fallback"
    password: !secret fallback_password

captive_portal:

# --- BLE Proxy for SwitchBot ---
esp32_ble_tracker:

bluetooth_proxy:
  active: true

# --- Sensors ---
sensor:
  - platform: dht
    model: DHT22
    pin: GPIO4
    temperature:
      name: "Office Temperature"
      id: office_temp
      filters:
        - offset: 0.0  # Calibrate if needed
    humidity:
      name: "Office Humidity"
    update_interval: 30s

binary_sensor:
  # PIR motion sensor
  - platform: gpio
    pin: GPIO14
    name: "Office Motion"
    id: office_motion
    device_class: motion
    filters:
      - delayed_off: 60s  # Stays "on" for 60s after last motion

  # Manual override button
  - platform: gpio
    pin:
      number: GPIO27
      mode: INPUT_PULLUP
      inverted: true
    name: "Office Heater Button"
    id: heater_button
    filters:
      - delayed_on: 50ms  # Debounce

# --- Status LED (uses onboard LED) ---
status_led:
  pin: GPIO2
```

### 4. ESPHome Secrets

Create or edit your `secrets.yaml` in the ESPHome config directory:

```yaml
wifi_ssid: "YOUR_WIFI_SSID"
wifi_password: "YOUR_WIFI_PASSWORD"
api_encryption_key: "generate-a-random-32-byte-base64-key"
ota_password: "pick-a-password"
fallback_password: "pick-a-fallback-password"
```

Generate the API encryption key in the ESPHome dashboard when creating the device - it will auto-generate one for you.

### 5. Flash and Adopt

1. Connect the ESP32 to your computer via USB
2. In ESPHome dashboard, click the three dots on your device and select **Install > Plug into this computer**
3. Select the serial port and flash
4. Once running, Home Assistant should auto-discover the device
5. Click **Configure** to adopt it

---

## SwitchBot Setup

### Physical Installation

1. Clean the surface of your heater's power button area
2. Attach the SwitchBot Bot using its adhesive mount so the arm presses the power button
3. Test it manually using the SwitchBot app to confirm it reliably presses the button
4. Set the SwitchBot to **Press mode** (if the heater has a single toggle button) or **Switch mode** (if it has distinct on/off)

### Home Assistant Integration

1. Go to **Settings > Devices & Services > Add Integration**
2. Search for **SwitchBot** and add it
3. It should discover the Bot via the ESP32 BLE proxy
4. If not auto-discovered, you may need to add it manually using the Bot's BLE MAC address (found in the SwitchBot app under device settings)

---

## Home Assistant Automation

Create this automation in **Settings > Automations & Scenes > Create Automation**:

### Heater ON - Motion Detected and Cold

```yaml
alias: "Office Heater ON"
description: "Turn on heater when office is occupied and cold"
trigger:
  - platform: state
    entity_id: binary_sensor.office_motion
    to: "on"
  - platform: numeric_state
    entity_id: sensor.office_temperature
    below: 20  # Celsius (~68F) - adjust to preference
condition:
  - condition: state
    entity_id: binary_sensor.office_motion
    state: "on"
  - condition: numeric_state
    entity_id: sensor.office_temperature
    below: 20
  - condition: state
    entity_id: switch.switchbot_bot  # Your SwitchBot entity ID
    state: "off"
action:
  - service: switch.turn_on
    entity_id: switch.switchbot_bot
mode: single
```

### Heater OFF - No Motion or Warm Enough

```yaml
alias: "Office Heater OFF"
description: "Turn off heater when unoccupied or warm enough"
trigger:
  - platform: state
    entity_id: binary_sensor.office_motion
    to: "off"
  - platform: numeric_state
    entity_id: sensor.office_temperature
    above: 22  # Celsius (~72F) - adjust to preference
condition:
  - condition: state
    entity_id: switch.switchbot_bot
    state: "on"
action:
  - service: switch.turn_off
    entity_id: switch.switchbot_bot
mode: single
```

### Manual Override Toggle

```yaml
alias: "Office Heater Manual Toggle"
description: "Button press toggles heater regardless of automation"
trigger:
  - platform: state
    entity_id: binary_sensor.office_heater_button
    to: "on"
action:
  - service: switch.toggle
    entity_id: switch.switchbot_bot
mode: single
```

---

## Safety Notes

- The heater's built-in thermostat and tip-over protection remain active since you're just pressing its button
- The `delayed_off: 60s` filter on the PIR sensor prevents the heater from toggling rapidly
- If WiFi or the ESP32 goes down, the SwitchBot stays in its last state - you may want to add a "turn off after X hours" failsafe automation in HA
- Consider adding a max-runtime automation (e.g., force off after 4 hours regardless of conditions)

### Recommended Failsafe Automation

```yaml
alias: "Office Heater Failsafe"
description: "Force off after 4 hours continuous run"
trigger:
  - platform: state
    entity_id: switch.switchbot_bot
    to: "on"
    for:
      hours: 4
action:
  - service: switch.turn_off
    entity_id: switch.switchbot_bot
  - service: notify.notify
    data:
      message: "Office heater auto-shutoff after 4 hours"
mode: single
```
