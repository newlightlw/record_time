-- 创建用户画像表
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mbti VARCHAR(10),
    occupation VARCHAR(100),
    personality TEXT,
    current_work TEXT,
    additional_info JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建记录表
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('audio', 'image', 'text')),
    content TEXT,
    file_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建AI分析表
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES records(id) ON DELETE CASCADE,
    analysis_result TEXT NOT NULL,
    sentiment VARCHAR(20),
    keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_created_at ON records(created_at DESC);
CREATE INDEX idx_ai_analyses_record_id ON ai_analyses(record_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- 启用行级安全策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- 用户画像表的RLS策略
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 记录表的RLS策略
CREATE POLICY "Users can view own records" ON records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON records
    FOR DELETE USING (auth.uid() = user_id);

-- AI分析表的RLS策略
CREATE POLICY "Users can view analyses of own records" ON ai_analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM records 
            WHERE records.id = ai_analyses.record_id 
            AND records.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analyses for own records" ON ai_analyses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM records 
            WHERE records.id = ai_analyses.record_id 
            AND records.user_id = auth.uid()
        )
    );

-- 设置权限
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;
GRANT ALL PRIVILEGES ON records TO authenticated;
GRANT ALL PRIVILEGES ON ai_analyses TO authenticated;

GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON records TO anon;
GRANT SELECT ON ai_analyses TO anon;