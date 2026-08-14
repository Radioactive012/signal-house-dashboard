-- Supabase Schema for Signal House Mastery
-- Run this in the Supabase SQL Editor

-- Create a table for storing user progress
CREATE TABLE user_progress (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  tasks JSONB DEFAULT '{}'::jsonb,
  passed JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only view their own progress
CREATE POLICY "Users can view their own progress" 
ON user_progress FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy so users can only update their own progress
CREATE POLICY "Users can update their own progress" 
ON user_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy so users can insert their initial progress
CREATE POLICY "Users can insert their own progress" 
ON user_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);
