import express from 'express';
import {
  getAllProfiles,
  getProfileById,
  addLinkedInProfile,
  deleteProfile,
  updateProfile
} from '../models/profile.model';

const router = express.Router();

// GET /api/profiles
router.get('/', async (req: any, res: any) => {
  const search = req.query.search?.toString().toLowerCase() || '';
  try {
    const profiles = await getAllProfiles();
    if (search) {
      const filtered = profiles.filter(p =>
        p.name?.toLowerCase().includes(search)
      );
      return res.json(filtered);
    }
    res.json(profiles);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch profiles' });
  }
});

// GET /api/profiles/:id
router.get('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const profile = await getProfileById(id);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
});

// POST /api/profiles
router.post('/', async (req, res) => {
  try {
    const profile = await addLinkedInProfile(req.body);
    res.status(201).json(profile);
  } catch (err) {
    console.error('Add error:', err);
    res.status(500).json({ message: 'Failed to save profile' });
  }
});

// PUT /api/profiles/:id
router.put('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const success = await updateProfile(id, req.body);
  if (!success) return res.status(404).json({ message: 'Profile not found' });
  res.json({ message: 'Profile updated' });
});

// DELETE /api/profiles/:id
router.delete('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const success = await deleteProfile(id);
  if (!success) return res.status(404).json({ message: 'Profile not found' });
  res.status(204).send();
});

export default router;
