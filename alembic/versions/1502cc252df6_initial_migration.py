"""Initial migration

Revision ID: 1502cc252df6
Revises: e459095f5f01
Create Date: 2026-01-04 22:51:15.908653

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1502cc252df6'
down_revision: Union[str, Sequence[str], None] = 'e459095f5f01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
