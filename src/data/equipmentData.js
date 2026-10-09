export const LAB_EQUIPMENT_CATEGORIES = [
  {
    category: 'Microcontrollers & Compute Engines',
    icon: 'Cpu',
    description: 'Silicon engines powering our autonomous robots, edge inference, and wireless nodes.',
    items: [
      { name: 'NVIDIA Jetson Orin Nano (8GB)', specs: '40 TOPS AI, Ampere GPU, 6-core ARM CPU', useCase: 'Host for ROS 2 & Real-time Vision' },
      { name: 'STM32H743ZI / Nucleo-144', specs: '480 MHz Cortex-M7, Double-Precision FPU, CAN-FD', useCase: 'High-frequency motor kinematics & control loops' },
      { name: 'ESP32-S3 Dual-Core Xtensa', specs: '240 MHz, 8MB PSRAM, Wi-Fi 4 + BLE 5.0, Vector Ext.', useCase: 'IoT gateways, Camera nodes & sensor nodes' },
      { name: 'Raspberry Pi 5 + Hailo-8L', specs: 'Quad Cortex-A76 @ 2.4GHz + 13 TOPS M.2 Hat', useCase: 'Avionics companion computer & flight logger' },
      { name: 'Texas Instruments C2000 Delfino', specs: 'Dual 200MHz C28x DSP Cores, High-res PWM', useCase: 'Digital power converters and 3-phase inverters' },
      { name: 'Xilinx Zynq-7000 SoC FPGA', specs: 'Dual ARM Cortex-A9 + 28nm FPGA Logic', useCase: 'High-speed sensor acquisition & digital signal processing' }
    ]
  },
  {
    category: 'Communication & Wireless Protocols',
    icon: 'Radio',
    description: 'Field buses, mesh topologies, and industrial telemetry interfaces implemented by the team.',
    items: [
      { name: 'LoRaWAN 868 / 915 MHz', specs: 'SX1262 Transceiver, SF7-SF12, +22dBm PA', useCase: 'Long-range campus telemetry & microgrid monitoring' },
      { name: 'CAN Bus & CANopen (ISO 11898)', specs: '1 Mbps Differential signaling, isolated transceivers', useCase: 'Internal robot backbone, motor ESCs & battery BMS' },
      { name: 'Industrial Modbus RTU / TCP', specs: 'RS-485 balanced transmission, CRC-16 check', useCase: 'Substation energy meter polling & PLC interoperability' },
      { name: 'Bluetooth Low Energy 5.3', specs: '2 Mbps PHY, Coded Long-Range PHY, BLE Mesh', useCase: 'Wearable health telemetry & mobile smartphone config' },
      { name: 'MQTT & WebSockets Realtime', specs: 'TLS 1.3 encrypted, QoS 0/1/2 payloads', useCase: 'Cloud ingestion to AWS IoT & Grafana dashboards' }
    ]
  },
  {
    category: 'Test, Measurement & EDA Infrastructure',
    icon: 'Activity',
    description: 'Precision bench instruments and electronic design automation tools.',
    items: [
      { name: 'Rigol DS1054Z & MSO5000', specs: 'Up to 350 MHz, 4-Channel, 8 GSa/s, Mixed Signal', useCase: 'Signal integrity, PWM deadtime, and bus debugging' },
      { name: 'Saleae Logic Pro 16', specs: '500 MS/s digital, USB 3.0, Protocol Decoders', useCase: 'SPI, I2C, UART, CAN, and SWD trace timing analysis' },
      { name: 'Altium Designer & KiCad 8.0', specs: 'Multi-layer ECAD, differential pair routing, 3D clearance', useCase: 'In-house custom PCB design and impedance matching' },
      { name: 'Siglent SSA3021X Spectrum Analyzer', specs: '9 kHz – 2.1 GHz, Tracking Generator', useCase: 'RF antenna tuning and pre-compliance EMI testing' },
      { name: 'Bambu Lab X1-Carbon 3D Printer', specs: 'Carbon fiber nylon, dual-extrusion, 20µm precision', useCase: 'Rapid mechanical chassis prototyping & sensor mounts' }
    ]
  }
];
