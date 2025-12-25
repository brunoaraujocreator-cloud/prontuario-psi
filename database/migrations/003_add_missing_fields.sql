-- Migration 003: Add Missing Fields
-- Adiciona campos faltantes nas tabelas existentes para suportar todas as funcionalidades do sistema HTML

-- Add fields to patients table
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Ativo', -- 'Ativo', 'Inativo'
  ADD COLUMN IF NOT EXISTS evolution JSONB DEFAULT '[]'::jsonb, -- Array de evoluções do paciente
  ADD COLUMN IF NOT EXISTS default_value DECIMAL(10,2) DEFAULT 0; -- Valor padrão para sessões

-- Add fields to sessions table
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS end_time TIME, -- Horário de término calculado
  ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false, -- Status de pagamento
  ADD COLUMN IF NOT EXISTS evolution_id UUID, -- ID da evolução relacionada (se houver)
  ADD COLUMN IF NOT EXISTS modality VARCHAR(50) DEFAULT 'Presencial'; -- 'Presencial', 'Online'

-- Add fields to groups table
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS start_time TIME, -- Horário de início do grupo
  ADD COLUMN IF NOT EXISTS end_time TIME, -- Horário de término do grupo (calculado)
  ADD COLUMN IF NOT EXISTS modality VARCHAR(50) DEFAULT 'Presencial', -- 'Presencial', 'Online'
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true, -- Status do grupo
  ADD COLUMN IF NOT EXISTS default_participant_value DECIMAL(10,2) DEFAULT 0; -- Valor padrão por participante

-- Add fields to reports table
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS report_date DATE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Vigente', -- 'Vigente', 'Cancelado'
  ADD COLUMN IF NOT EXISTS cancel_date DATE,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Add field to invoices table
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- Create additional indexes for new fields
CREATE INDEX IF NOT EXISTS idx_patients_service_type_id ON patients(service_type_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_sessions_is_group ON sessions(is_group);
CREATE INDEX IF NOT EXISTS idx_sessions_group_id ON sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_sessions_paid ON sessions(paid);
CREATE INDEX IF NOT EXISTS idx_groups_service_type_id ON groups(service_type_id);
CREATE INDEX IF NOT EXISTS idx_groups_active ON groups(active);
CREATE INDEX IF NOT EXISTS idx_reports_invoice_id ON reports(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_invoices_group_id ON invoices(group_id);

