# Visual Network Config Generator

A web app for visually assigning network interfaces to a Nexus vPC switch pair and generating NX-OS uplink configuration.

## Features

- **Visual topology canvas** — Drag-and-drop switch and host nodes with React Flow
- **Live edge rendering** — Interface links appear on the canvas as you type
- **NX-OS config generation** — Produces per-switch config with interface, port-channel, and vPC stanzas
- **Auto-derived PO/vPC IDs** — Concatenates module+port from the lowest-numbered interface (e.g., `Eth1/12` → `112`), with manual override
- **Validation** — Detects duplicate vPC IDs, channel-groups, and interface conflicts
- **Save/Load/Clone** — Persist topologies to SQLite; clone for quick variations

## Generated Config Example

```
! Switch-A

interface Ethernet1/12
  description HOST1-uplink
  switchport mode trunk
  switchport trunk allowed vlan 100,200
  channel-group 112 mode active
  no shutdown

interface port-channel112
  description HOST1-uplink
  switchport mode trunk
  switchport trunk allowed vlan 100,200
  vpc 112
  no shutdown
```

## Tech Stack

- **Backend:** Python, FastAPI, SQLite
- **Frontend:** React, TypeScript, Vite, React Flow (@xyflow/react)

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+

### Setup

```bash
# Clone the repo
git clone https://github.com/rohscx/visual-network-config-generator.git
cd visual-network-config-generator

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Run

```bash
python run.py
```

This starts:
- Backend API on `http://localhost:8000`
- Frontend dev server on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

## Usage

1. **Name your switches** using the A/B fields in the toolbar
2. **Add hosts** with the `+ Host` button
3. **Select a host** to open the connection config panel
4. **Enter interfaces** (comma-separated, e.g., `Eth1/1, Eth1/2`) for each switch
5. **Set description and VLANs** for the connection
6. **Save** your topology
7. **Generate** to produce NX-OS config — copy per-switch output to clipboard

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/topologies` | List saved topologies |
| GET | `/api/topologies/{id}` | Load full topology |
| POST | `/api/topologies` | Create new topology |
| PUT | `/api/topologies/{id}` | Update topology |
| DELETE | `/api/topologies/{id}` | Delete topology |
| POST | `/api/topologies/{id}/clone` | Clone topology |
| POST | `/api/topologies/{id}/generate` | Generate NX-OS config |
| POST | `/api/validate` | Validate without saving |
