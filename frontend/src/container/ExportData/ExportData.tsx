import { createSignal, createResource, Show, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

type Profile = {
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
  cons_int_id: string | null;
  crawled_at?: string;
};

const fetchProfiles = async (search = '') => {
  const res = await fetch(`http://localhost:5000/api/profiles?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return await res.json();
};

export default function ExportDataContainer() {
  const [search, setSearch] = createSignal('');
  const [selectedIds, setSelectedIds] = createStore<{ [id: number]: boolean }>({});
  const [selectedProfile, setSelectedProfile] = createSignal<Profile | null>(null);

  const [profiles, { refetch }] = createResource(search, fetchProfiles);

  const toggleSelect = (id: number) => {
    setSelectedIds(id, v => !v);
  };

  const deleteProfile = async (id: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    await fetch(`http://localhost:5000/api/profiles/${id}`, { method: 'DELETE' });
    refetch();
  };

  const exportSelected = async () => {
    const selected = profiles()?.filter(p => selectedIds[p.id]);
    if (!selected || selected.length === 0) {
      alert('No profiles selected');
      return;
    }

    const zip = new JSZip();

    for (const profile of selected) {
      const htmlContent = `
      <html>
        <head><title>${profile.name || 'Unnamed Profile'}</title></head>
        <body>
          <h1>${profile.name || 'No Name'}</h1>
          <p><strong>Cons Int ID:</strong> ${profile.cons_int_id || '-'}</p>
          <p><strong>Location:</strong> ${profile.location || '-'}</p>
          <p><strong>Bio:</strong> ${profile.bio || '-'}</p>
          <p><strong>About:</strong> ${profile.about || '-'}</p>
          <p><strong>Status:</strong> ${profile.crawl_status || '-'}</p>

          <h2>Experience</h2>
          <ul>
            ${profile.experience.map((e: any) => `
              <li>
                <strong>${e.company || 'No company'}</strong> - ${e.meta || ''}
                <ul>
                  ${e.summary?.map((s: any) => `<li>${s.title}: ${s.description || ''}</li>`).join('')}
                </ul>
              </li>
            `).join('')}
          </ul>

          <h2>Education</h2>
          <pre>${JSON.stringify(profile.education, null, 2)}</pre>

          <h2>Certificates</h2>
          <pre>${JSON.stringify(profile.certificates, null, 2)}</pre>

          <h2>Skills</h2>
          <pre>${JSON.stringify(profile.skills, null, 2)}</pre>

          <p><a href="${profile.profile_url}" target="_blank">View LinkedIn Profile</a></p>
        </body>
      </html>
    `.trim();

      const filename = `${(profile.name || `profile-${profile.id}`).replace(/[^\w\s]/gi, '')}.html`;
      zip.file(filename, htmlContent);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'linkedin_profiles.zip');
  };

  return (
    <div class="p-4 space-y-4">
      <div class="flex gap-2 items-center">
        <input
          type="text"
          class="border p-2 rounded"
          placeholder="Search by name or Cons Int ID"
          value={search()}
          onInput={e => setSearch(e.currentTarget.value)}
        />
        <button onClick={() => refetch()} class="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
        <button onClick={exportSelected} class="bg-green-600 text-white px-4 py-2 rounded">
          Export Selected
        </button>
      </div>

      <Show when={profiles()} fallback={<p>Loading...</p>}>
        <table class="w-full border text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2">Select</th>
              <th class="p-2">Name</th>
              <th class="p-2">Cons Int ID</th>
              <th class="p-2">Location</th>
              <th class="p-2">Status</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <For each={profiles()}>{profile => (
              <tr class="border-t hover:bg-gray-50">
                <td class="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={!!selectedIds[profile.id]}
                    onChange={() => toggleSelect(profile.id)}
                  />
                </td>
                <td class="p-2">{profile.name}</td>
                <td class="p-2">{profile.cons_int_id}</td>
                <td class="p-2">{profile.location}</td>
                <td class="p-2">{profile.crawl_status}</td>
                <td class="p-2 flex gap-2">
                  <button
                    onClick={() => setSelectedProfile(profile)}
                    class="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    class="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )}</For>
          </tbody>
        </table>
      </Show>

      {/* Embedded Profile Viewer */}
      <Show when={selectedProfile()}>
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              class="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedProfile(null)}
            >
              ✕
            </button>

            <h2 class="text-2xl font-bold mb-4">Profile Details</h2>

            <div class="space-y-3 text-sm">
              <div>
                <span class="font-semibold">Name:</span> {selectedProfile()?.name || '—'}
              </div>
              <div>
                <span class="font-semibold">Location:</span> {selectedProfile()?.location || '—'}
              </div>
              <div>
                <span class="font-semibold">Cons Int ID:</span> {selectedProfile()?.cons_int_id || '—'}
              </div>
              <div>
                <span class="font-semibold">Status:</span> {selectedProfile()?.crawl_status || '—'}
              </div>
              <div>
                <span class="font-semibold">Bio:</span>
                <p class="ml-2 text-gray-700">{selectedProfile()?.bio || '—'}</p>
              </div>
              <div>
                <span class="font-semibold">About:</span>
                <p class="ml-2 text-gray-700">{selectedProfile()?.about || '—'}</p>
              </div>

              <div>
                <h3 class="font-semibold mt-4 mb-1">Experience</h3>
                <ul class="list-disc list-inside ml-2 space-y-1">
                  <For each={selectedProfile()?.experience}>{exp => (
                    <li>
                      <div>
                        <span class="font-semibold">Title:</span> {exp.title || exp.meta || '—'}
                      </div>
                      <div>
                        <span class="font-semibold">Company:</span> {exp.company || '—'}
                      </div>
                      {exp.description && (
                        <div>
                          <span class="font-semibold">Description:</span>
                          <p class="ml-2">{exp.description}</p>
                        </div>
                      )}
                    </li>
                  )}</For>
                </ul>
              </div>

              <div>
                <h3 class="font-semibold mt-4 mb-1">Education</h3>
                <ul class="list-disc list-inside ml-2">
                  <For each={selectedProfile()?.education}>{edu => (
                    <li>{JSON.stringify(edu)}</li>
                  )}</For>
                </ul>
              </div>

              <div>
                <h3 class="font-semibold mt-4 mb-1">Certificates</h3>
                <ul class="list-disc list-inside ml-2">
                  <For each={selectedProfile()?.certificates}>{cert => (
                    <li>{JSON.stringify(cert)}</li>
                  )}</For>
                </ul>
              </div>

              <div>
                <h3 class="font-semibold mt-4 mb-1">Skills</h3>
                <div class="flex flex-wrap gap-2 ml-1">
                  <For each={selectedProfile()?.skills}>{skill => (
                    <span class="bg-gray-200 px-2 py-1 rounded text-sm">{skill}</span>
                  )}</For>
                </div>
              </div>

              <div>
                <span class="font-semibold">Crawled At:</span> {selectedProfile()?.crawled_at || '—'}
              </div>

              <div class="mt-2">
                <a
                  href={selectedProfile()?.profile_url}
                  target="_blank"
                  class="text-blue-600 underline"
                >
                  View on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
