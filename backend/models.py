from pydantic import BaseModel
from typing import Optional


class ConnectionGroupCreate(BaseModel):
    host_id: str
    description: str = ""
    trunk_vlans: str = ""
    channel_group: Optional[int] = None
    vpc_id: Optional[int] = None
    switch_a_interfaces: list[str] = []
    switch_b_interfaces: list[str] = []


class ConnectionGroupRead(BaseModel):
    id: str
    topology_id: str
    host_id: str
    description: str = ""
    trunk_vlans: str = ""
    channel_group: Optional[int] = None
    vpc_id: Optional[int] = None
    switch_a_interfaces: list[str] = []
    switch_b_interfaces: list[str] = []
    effective_channel_group: Optional[int] = None
    effective_vpc_id: Optional[int] = None


class HostCreate(BaseModel):
    id: str
    name: str
    position_x: float = 0
    position_y: float = 0


class HostRead(BaseModel):
    id: str
    topology_id: str
    name: str
    position_x: float = 0
    position_y: float = 0
    connection_group: Optional[ConnectionGroupRead] = None


class TopologySave(BaseModel):
    name: str
    switch_a_name: str = "Switch-A"
    switch_b_name: str = "Switch-B"
    canvas_state: dict = {}
    hosts: list[HostCreate] = []
    connection_groups: list[ConnectionGroupCreate] = []


class TopologyRead(BaseModel):
    id: str
    name: str
    switch_a_name: str
    switch_b_name: str
    canvas_state: dict = {}
    created_at: str
    updated_at: str
    hosts: list[HostRead] = []


class TopologySummary(BaseModel):
    id: str
    name: str
    updated_at: str


class ValidationError(BaseModel):
    level: str  # "error" | "warning"
    message: str
    related_host: Optional[str] = None


class GeneratedConfig(BaseModel):
    switch_a_name: str
    switch_a_config: str
    switch_b_name: str
    switch_b_config: str
    validation_errors: list[ValidationError] = []


class CloneRequest(BaseModel):
    name: str
