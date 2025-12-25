-- Migration 002: Complete Schema
-- Adiciona todas as tabelas faltantes para suportar todas as funcionalidades do sistema HTML

-- Service Types table (Tipos de Atendimento)
CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL, -- Duração em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Expense Categories table (Categorias de Despesas)
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Expense Types table (Tipos de Despesas)
CREATE TABLE IF NOT EXISTS expense_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, category_id)
);

-- Event Categories table (Categorias de Eventos)
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Group Participants table (Participantes de Grupos - relação many-to-many)
CREATE TABLE IF NOT EXISTS group_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  value DECIMAL(10,2) DEFAULT 0, -- Valor específico do participante
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, patient_id)
);

-- Demonstratives table (Demonstrativos Anuais)
CREATE TABLE IF NOT EXISTS demonstratives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'Aberto', -- 'Aberto', 'Fechado', 'Cancelado'
  document_number VARCHAR(100), -- Formato: XXX/AA
  demonstrative_date DATE,
  invoice_numbers TEXT[], -- Array de números de notas fiscais
  value DECIMAL(10,2) DEFAULT 0,
  cancel_date DATE,
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, patient_id, year)
);

-- Description Mappings table (Mapeamento de Descrições)
CREATE TABLE IF NOT EXISTS description_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, patient_id, description)
);

-- Recent Actions table (Histórico de Ações Recentes)
CREATE TABLE IF NOT EXISTS recent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'create', 'edit', 'delete', 'restore'
  entity_type VARCHAR(50) NOT NULL, -- 'patient', 'session', 'report', 'expense', 'demonstrative', 'event', 'group'
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255),
  details JSONB, -- Detalhes adicionais da ação
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change History table (Histórico de Alterações por Entidade)
CREATE TABLE IF NOT EXISTS change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  field VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  action VARCHAR(50) NOT NULL, -- 'create', 'edit', 'delete', 'restore'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trash table (Lixeira - Soft Delete)
CREATE TABLE IF NOT EXISTS trash (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'patient', 'session', 'report', 'expense', 'demonstrative', 'event', 'group', 'groupSession'
  entity_id UUID NOT NULL,
  entity_data JSONB NOT NULL, -- Dados completos da entidade antes de ser excluída
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by VARCHAR(100) DEFAULT 'user'
);

-- Group Payment Status History table (Histórico de Status de Pagamento de Grupos)
CREATE TABLE IF NOT EXISTS group_payment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  end_time TIME,
  status VARCHAR(50) NOT NULL, -- 'Pago', 'Parcialmente Pago', 'Pagamento Pendente'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_types_user_id ON service_types(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_types_user_id ON expense_types(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_types_category_id ON expense_types(category_id);
CREATE INDEX IF NOT EXISTS idx_event_categories_user_id ON event_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_group_id ON group_participants(group_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_patient_id ON group_participants(patient_id);
CREATE INDEX IF NOT EXISTS idx_demonstratives_user_id ON demonstratives(user_id);
CREATE INDEX IF NOT EXISTS idx_demonstratives_patient_id ON demonstratives(patient_id);
CREATE INDEX IF NOT EXISTS idx_demonstratives_year ON demonstratives(year);
CREATE INDEX IF NOT EXISTS idx_description_mappings_user_id ON description_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_description_mappings_patient_id ON description_mappings(patient_id);
CREATE INDEX IF NOT EXISTS idx_recent_actions_user_id ON recent_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_actions_entity ON recent_actions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_recent_actions_timestamp ON recent_actions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_change_history_user_id ON change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_change_history_entity ON change_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_change_history_timestamp ON change_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trash_user_id ON trash(user_id);
CREATE INDEX IF NOT EXISTS idx_trash_entity ON trash(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_trash_deleted_at ON trash(deleted_at);
CREATE INDEX IF NOT EXISTS idx_group_payment_status_history_user_id ON group_payment_status_history(user_id);
CREATE INDEX IF NOT EXISTS idx_group_payment_status_history_group_id ON group_payment_status_history(group_id);

-- Create triggers for updated_at
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON service_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_types_updated_at BEFORE UPDATE ON expense_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_categories_updated_at BEFORE UPDATE ON event_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_participants_updated_at BEFORE UPDATE ON group_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demonstratives_updated_at BEFORE UPDATE ON demonstratives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_description_mappings_updated_at BEFORE UPDATE ON description_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE demonstratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE description_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_payment_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage own service_types" ON service_types
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own expense_categories" ON expense_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own expense_types" ON expense_types
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own event_categories" ON event_categories
  FOR ALL USING (auth.uid() = user_id);

-- Group participants: users can manage participants of their own groups
CREATE POLICY "Users can manage participants of own groups" ON group_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_participants.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own demonstratives" ON demonstratives
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own description_mappings" ON description_mappings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recent_actions" ON recent_actions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own change_history" ON change_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own trash" ON trash
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own group_payment_status_history" ON group_payment_status_history
  FOR ALL USING (auth.uid() = user_id);

