
-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions policies
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Farmers can insert questions" ON questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Farmers can update own questions" ON questions FOR UPDATE USING (
  farmer_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Farmers can delete own questions" ON questions FOR DELETE USING (
  farmer_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
);

-- Answers policies
CREATE POLICY "Anyone can view answers" ON answers FOR SELECT USING (true);
CREATE POLICY "Experts can insert answers" ON answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'expert')
);
CREATE POLICY "Experts can update own answers" ON answers FOR UPDATE USING (
  expert_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'expert')
);
CREATE POLICY "Experts can delete own answers" ON answers FOR DELETE USING (
  expert_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'expert')
);

-- Warehouses policies
CREATE POLICY "Anyone can view warehouses" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Vendors can insert warehouses" ON warehouses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
);
CREATE POLICY "Vendors can update own warehouses" ON warehouses FOR UPDATE USING (
  vendor_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
);
CREATE POLICY "Vendors can delete own warehouses" ON warehouses FOR DELETE USING (
  vendor_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
);

-- Crop categories policies (read-only for all users)
CREATE POLICY "Anyone can view crop categories" ON crop_categories FOR SELECT USING (true);
