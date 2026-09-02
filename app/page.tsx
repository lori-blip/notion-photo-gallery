'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ImagePlus, Pencil, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_PHOTOS = 15;
const DB_NAME = 'frameflow-galleries';
const STORE_NAME = 'galleries';
type Photo = { id: string; src: string };
type Gallery = { id: string; photos: Photo[]; saved: boolean };

function createId() { return crypto.randomUUID().slice(0, 8); }
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function loadGallery(id: string): Promise<Gallery | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveGallery(gallery: Gallery) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(gallery);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [editing, setEditing] = useState(true);
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('gallery') || createId();
    if (!params.get('gallery')) history.replaceState(null, '', `?gallery=${id}`);
    loadGallery(id).then((saved) => { const value = saved || { id, photos: [], saved: false }; setGallery(value); setEditing(!value.saved); })
      .catch(() => setGallery({ id, photos: [], saved: false }));
  }, []);

  const choosePhotos = async (files: FileList | null) => {
    if (!gallery || !files) return;
    const selected = [...files].filter((file) => file.type.startsWith('image/')).slice(0, MAX_PHOTOS - gallery.photos.length);
    const added = await Promise.all(selected.map(async (file) => ({ id: createId(), src: await readImage(file) })));
    setGallery({ ...gallery, photos: [...gallery.photos, ...added], saved: false });
    if (fileRef.current) fileRef.current.value = '';
  };
  const remove = (id: string) => gallery && setGallery({ ...gallery, photos: gallery.photos.filter((photo) => photo.id !== id), saved: false });
  const save = async () => {
    if (!gallery?.photos.length) return;
    const updated = { ...gallery, saved: true };
    await saveGallery(updated); setGallery(updated); setEditing(false); setActive(0);
    setNotice('Gallery saved'); setTimeout(() => setNotice(''), 1800);
  };
  const goTo = (index: number) => {
    if (!gallery?.photos.length) return;
    const next = (index + gallery.photos.length) % gallery.photos.length;
    setActive(next);
    scrollerRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  if (!gallery) return <main className="loading">Preparing your gallery…</main>;
  return <main className="simple-shell">
    {editing ? <section className="builder">
      <div className="simple-heading"><div><p className="eyebrow">PHOTO GALLERY</p><h1>Add your photos</h1><p>Click the blank card to upload. Add up to 15.</p></div><span>{gallery.photos.length} / {MAX_PHOTOS}</span></div>
      <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={(event) => choosePhotos(event.target.files)} />
      <div className="upload-grid">
        {gallery.photos.map((photo, index) => <div className="upload-card" key={photo.id}><img src={photo.src} alt={`Selected photo ${index + 1}`} /><button className="remove-photo" onClick={() => remove(photo.id)} aria-label={`Remove photo ${index + 1}`}><Trash2 /></button><span>{index + 1}</span></div>)}
        {gallery.photos.length < MAX_PHOTOS && <button className={`add-card ${gallery.photos.length ? 'plus-card' : ''}`} onClick={() => fileRef.current?.click()}><span className="add-icon">{gallery.photos.length ? <Plus /> : <ImagePlus />}</span><strong>{gallery.photos.length ? 'Add another' : 'Click to upload'}</strong>{!gallery.photos.length && <small>JPG, PNG, GIF or WebP</small>}</button>}
      </div>
      <div className="builder-actions"><Button size="lg" onClick={save} disabled={!gallery.photos.length}><Save /> Save gallery</Button></div>
    </section> : <section className="saved-gallery">
      <header><div><p className="eyebrow">PHOTO GALLERY</p><h1>Your gallery</h1></div><Button variant="outline" onClick={() => setEditing(true)}><Pencil /> Edit</Button></header>
      <div className="card-stage">
        <div className="swipe-cards" ref={scrollerRef} onScroll={(event) => { const el = event.currentTarget; const width = el.clientWidth; if (width) setActive(Math.round(el.scrollLeft / width)); }}>
          {gallery.photos.map((photo, index) => <article className="swipe-card" key={photo.id}><img src={photo.src} alt={`Gallery photo ${index + 1}`} /><span>{String(index + 1).padStart(2, '0')} / {String(gallery.photos.length).padStart(2, '0')}</span></article>)}
        </div>
        {gallery.photos.length > 1 && <><button className="card-arrow left" onClick={() => goTo(active - 1)} aria-label="Previous photo"><ChevronLeft /></button><button className="card-arrow right" onClick={() => goTo(active + 1)} aria-label="Next photo"><ChevronRight /></button></>}
      </div>
      {gallery.photos.length > 1 && <div className="card-dots">{gallery.photos.map((photo, index) => <button key={photo.id} className={active === index ? 'active' : ''} onClick={() => goTo(index)} aria-label={`View photo ${index + 1}`} />)}</div>}
      <p className="swipe-hint">Swipe to see the next photo</p>
    </section>}
    {notice && <div className="notice"><Check /> {notice}</div>}
  </main>;
}
