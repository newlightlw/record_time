-- 插入示例用户画像数据（需要先有用户注册）
-- 这些数据将在用户注册后通过应用程序插入

-- 创建一个函数来插入示例记录和分析（当用户首次登录时调用）
CREATE OR REPLACE FUNCTION create_sample_data_for_user(user_uuid UUID)
RETURNS void AS $$
DECLARE
    record_1_id UUID;
    record_2_id UUID;
    record_3_id UUID;
BEGIN
    -- 插入示例记录
    INSERT INTO records (id, user_id, type, content, created_at) VALUES 
    (gen_random_uuid(), user_uuid, 'text', '今天的产品评审会议很顺利，团队对新功能的反馈都很积极。感觉大家的协作越来越默契了。', NOW() - INTERVAL '2 days')
    RETURNING id INTO record_1_id;
    
    INSERT INTO records (id, user_id, type, content, created_at) VALUES 
    (gen_random_uuid(), user_uuid, 'text', '下午和设计师讨论了用户界面的改进方案，感觉找到了很好的解决思路。用户体验确实是产品成功的关键。', NOW() - INTERVAL '1 day')
    RETURNING id INTO record_2_id;
    
    INSERT INTO records (id, user_id, type, content, created_at) VALUES 
    (gen_random_uuid(), user_uuid, 'text', '晚上读了一本关于用户心理学的书，对理解用户需求有了新的启发。学习永远是最好的投资。', NOW() - INTERVAL '6 hours')
    RETURNING id INTO record_3_id;
    
    -- 插入对应的AI分析
    INSERT INTO ai_analyses (record_id, analysis_result, sentiment, keywords, created_at) VALUES 
    (record_1_id, '从这段记录可以看出，你在工作中展现出了很强的团队协作能力和积极的心态。作为一个INFP类型的产品经理，你善于观察团队动态，并从中获得正面的能量。这种对团队反馈的敏感度正是你性格中"情感"维度的体现，有助于你在产品决策中更好地平衡各方需求。', 'positive', '["团队协作", "积极心态", "产品管理", "沟通能力"]', NOW() - INTERVAL '2 days'),
    (record_2_id, '这段记录体现了你作为产品经理的专业素养和对用户体验的深度思考。你的"直觉"特质让你能够快速捕捉到设计改进的机会，而"感知"特质则帮助你保持开放的心态去探索不同的解决方案。这种对用户体验的重视与你的职业角色高度契合。', 'positive', '["用户体验", "设计思维", "问题解决", "专业成长"]', NOW() - INTERVAL '1 day'),
    (record_3_id, '你对学习的热情和对知识的渴求体现了INFP类型中"内向"和"直觉"的特质。通过阅读来获取新的视角和启发，这种自我提升的方式很符合你的性格特点。将理论知识与实际工作相结合，展现了你在个人成长方面的主动性和深度思考能力。', 'positive', '["持续学习", "自我提升", "理论实践", "深度思考"]', NOW() - INTERVAL '6 hours');
END;
$$ LANGUAGE plpgsql;

-- 创建触发器函数，当新用户注册时自动创建示例数据
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- 为新用户创建示例数据
    PERFORM create_sample_data_for_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 注意：由于我们使用的是 auth.users 表，我们不能直接在其上创建触发器
-- 相反，我们将在应用程序中处理新用户注册后的示例数据创建