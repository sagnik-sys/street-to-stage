-- Create enum types for better data consistency
CREATE TYPE public.department_type AS ENUM (
  'electricity',
  'pwd',
  'roads_transport', 
  'garbage_sanitation',
  'water_supply',
  'others'
);

CREATE TYPE public.report_status AS ENUM (
  'pending',
  'processing', 
  'completed',
  'forwarded'
);

CREATE TYPE public.user_role AS ENUM (
  'user',
  'admin',
  'superadmin'
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  department department_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department department_type NOT NULL,
  issue_type TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  media_urls TEXT[],
  voice_note_url TEXT,
  assigned_admin_id UUID REFERENCES public.profiles(id),
  processing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create report_history table for tracking status changes
CREATE TABLE public.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) NOT NULL,
  old_status report_status,
  new_status report_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins and superadmins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports" 
ON public.reports FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create reports" 
ON public.reports FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending reports" 
ON public.reports FOR UPDATE 
USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can view department reports"
ON public.reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND (role = 'superadmin' OR department = reports.department)
  )
);

CREATE POLICY "Admins can update department reports"
ON public.reports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
    AND (role = 'superadmin' OR department = reports.department)
  )
);

-- RLS Policies for report_history
CREATE POLICY "Users can view history of their reports"
ON public.report_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reports 
    WHERE id = report_history.report_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view and create history for their department"
ON public.report_history FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.reports r ON r.id = report_history.report_id
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'superadmin')
    AND (p.role = 'superadmin' OR p.department = r.department)
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('reports-media', 'reports-media', true);

-- Storage policies for reports media
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports-media');

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'reports-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);