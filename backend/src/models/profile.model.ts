import { pool } from '../db';
import type { QueryResult } from 'pg';

export type LinkedInProfile = {
  id: number;
  name: string | null;
  location: string | null;
  bio: string | null;
  about: string | null;
  profile_url: string;
  crawl_status: any;
  experience: any[];
  education: any[];
  certificates: any[];
  skills: any[];
  crawled_at?: string;
};

type NewProfile = Omit<LinkedInProfile, 'id' | 'crawled_at'>;

export async function addLinkedInProfile(profile: any): Promise<LinkedInProfile> {
  const {
    name, location, bio, about, profile_url, crawl_status,
    experience, education, certificates, skills
  } = profile;

  const result: QueryResult<LinkedInProfile> = await pool.query(
    `INSERT INTO linkedin_profiles 
      (name, location, bio, about, profile_url, crawl_status, experience, education, certificates, skills)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb)
     RETURNING *`,
    [
      name,
      location,
      bio,
      about,
      profile_url,
      crawl_status,
      JSON.stringify(experience),
      JSON.stringify(education),
      JSON.stringify(certificates),
      JSON.stringify(skills),
    ]
  );

  return result.rows[0];
}

export async function getAllProfiles(): Promise<LinkedInProfile[]> {
  const result: QueryResult<LinkedInProfile> = await pool.query(`SELECT * FROM linkedin_profiles`);
  return result.rows;
}

export async function getProfileById(id: number): Promise<LinkedInProfile | null> {
  const result: QueryResult<LinkedInProfile> = await pool.query(
    `SELECT * FROM linkedin_profiles WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function deleteProfile(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM linkedin_profiles WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function updateProfile(
  id: number,
  data: Partial<Omit<NewProfile, 'profile_url'>>
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE linkedin_profiles
     SET name = COALESCE($1, name),
         location = COALESCE($2, location),
         bio = COALESCE($3, bio),
         about = COALESCE($4, about),
         crawl_status = COALESCE($5, crawl_status),
         experience = COALESCE($6::jsonb, experience),
         education = COALESCE($7::jsonb, education),
         certificates = COALESCE($8::jsonb, certificates),
         skills = COALESCE($9::jsonb, skills)
     WHERE id = $10`,
    [
      data.name ?? null,
      data.location ?? null,
      data.bio ?? null,
      data.about ?? null,
      data.crawl_status ?? null,
      data.experience ? JSON.stringify(data.experience) : null,
      data.education ? JSON.stringify(data.education) : null,
      data.certificates ? JSON.stringify(data.certificates) : null,
      data.skills ? JSON.stringify(data.skills) : null,
      id
    ]
  );

  return (result.rowCount ?? 0) > 0;
}
