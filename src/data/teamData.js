export const TEAM_DOMAINS = [
  { id: 'all', label: 'All Engineers' },
  { id: 'Admin', label: 'Administration' },
  { id: 'Robotics Lead', label: 'Robotics & Control' },
  { id: 'Hardware Engineer', label: 'PCB & Power' },
  { id: 'Developer', label: 'Developers & Firmware' },
  { id: 'Researcher', label: 'Research & AI' }
];

// No dummy personas - team members are dynamically sourced from verified registered workspace users
export const TEAM_MEMBERS = [];

export const LAB_STATS = [
  { label: 'Autonomous Systems', value: 'Active', icon: 'Bot', change: 'ROS 2 & CANopen Telemetry' },
  { label: 'IoT Telemetry Mesh', value: 'Online', icon: 'Radio', change: '868MHz & MQTT Mesh' },
  { label: 'Hardware Bench', value: 'Equipped', icon: 'Cpu', change: 'Oscilloscopes & Logic Pro' },
  { label: 'Telemetry Stream', value: '50 Hz', icon: 'Zap', change: 'Real-time CAN & Serial' },
];
