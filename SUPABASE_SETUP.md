# Supabase 연결 방법

1. Supabase 프로젝트의 **Authentication → Sign In / Providers → Anonymous**를 활성화합니다.
2. **SQL Editor**에서 `supabase-schema.sql` 전체를 실행합니다.
3. Vercel 프로젝트의 **Settings → Environment Variables**에 아래 값을 추가합니다.
   - `SUPABASE_URL`: Supabase Project URL
   - `SUPABASE_ANON_KEY`: Supabase Publishable key 또는 anon key
4. 두 환경변수를 Production, Preview, Development에 적용하고 Vercel에서 다시 배포합니다.

`service_role` 키는 브라우저나 Vercel 빌드 환경변수로 절대 넣지 마세요.
