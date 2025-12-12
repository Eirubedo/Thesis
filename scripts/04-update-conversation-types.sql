-- Update conversation types constraint to include quick-assessment and knowledge-test
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_conversation_type_check;
ALTER TABLE conversations ADD CONSTRAINT conversations_conversation_type_check 
  CHECK (conversation_type IN ('chat', 'assessment', 'education', 'quick-assessment', 'knowledge-test'));
