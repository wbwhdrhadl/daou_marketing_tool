from pydantic import BaseModel
from typing import Optional

class ProposalCreate(BaseModel):
    target_partner: str
    content: str
    is_upsell: bool = False