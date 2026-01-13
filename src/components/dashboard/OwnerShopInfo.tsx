'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Info, Image as ImageIcon, X, Loader2, Plus, Clock, Tag, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

// Types (re-defined locally or imported)
interface OwnerShopInfoProps {
    shopId: string;
}

export default function OwnerShopInfo({ shopId }: OwnerShopInfoProps) {
    const [shop, setShop] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    // Sub-form states
    const [services, setServices] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    // FIX: price can be '' to prevent leading zeros
    const [newService, setNewService] = useState<{ name: { en: string }, durationMin: number, price: number | '' }>({ name: { en: '' }, durationMin: 60, price: 0 });
    const [newCoupon, setNewCoupon] = useState({
        code: '', discountType: 'percent', discountValue: 10, minPurchase: 0, validUntil: ''
    });
    const [addingService, setAddingService] = useState(false);
    const [addingCoupon, setAddingCoupon] = useState(false);

    useEffect(() => {
        if (shopId) {
            loadShop();
            loadServices();
            loadCoupons();
        }
    }, [shopId]);

    const loadShop = async () => {
        try {
            const res = await fetch(`/api/shops/${shopId}`);
            if (res.ok) {
                const data = await res.json();
                setShop(data.shop);
                setImages(data.shop.images || []);
            }
        } catch (error) {
            console.error('Failed to load shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            const res = await fetch(`/api/services/${shopId}`);
            if (res.ok) {
                const data = await res.json();
                // API returns array directly
                setServices(Array.isArray(data) ? data : data.services || []);
            }
        } catch (e) {
            console.error('Failed to load services:', e);
        }
    };

    const loadCoupons = async () => {
        try {
            const res = await fetch(`/api/coupons?shopId=${shopId}`);
            if (res.ok) {
                const data = await res.json();
                // API returns array directly
                setCoupons(Array.isArray(data) ? data : data.coupons || []);
            }
        } catch (e) {
            console.error('Failed to load coupons:', e);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setShop((prev: any) => {
            if (!prev) return null;
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: { ...(prev as any)[parent], [child]: value }
                };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = new FormData();
            data.append('file', file);
            data.append('folder', 'shops');

            const res = await fetch('/api/upload', { method: 'POST', body: data });
            if (res.ok) {
                const result = await res.json();
                handleInputChange('image_url', result.url);
            }
        } catch (error) {
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        try {
            setUploading(true);
            const newImages = [...images];
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const data = new FormData();
                data.append('file', file);
                data.append('folder', 'shops-gallery');

                const res = await fetch('/api/upload', { method: 'POST', body: data });
                if (res.ok) {
                    const result = await res.json();
                    newImages.push(result.url);
                }
            }
            setImages(newImages);
        } catch (error) {
            alert('Some images failed to upload');
        } finally {
            setUploading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    // --- Services Logic ---
    const handleAddService = async () => {
        if (!newService.name.en || newService.price === '' || newService.price <= 0) return alert('Please enter name and price');
        setAddingService(true);
        try {
            const res = await fetch(`/api/services/${shopId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newService, price: Number(newService.price) })
            });
            if (res.ok) {
                loadServices();
                setNewService({ name: { en: '' }, durationMin: 60, price: 0 });
            } else {
                const err = await res.json();
                alert(`Failed to add service: ${err.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAddingService(false);
        }
    };

    // --- Coupons Logic ---
    const handleAddCoupon = async () => {
        if (!newCoupon.code || !newCoupon.validUntil) return alert('Please enter code and expiry date');
        setAddingCoupon(true);
        try {
            const res = await fetch(`/api/coupons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCoupon, shopId })
            });
            if (res.ok) {
                loadCoupons();
                setNewCoupon({ code: '', discountType: 'percent', discountValue: 10, minPurchase: 0, validUntil: '' });
            } else {
                alert('Failed to add coupon');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAddingCoupon(false);
        }
    };

    // --- Delete Handlers ---
    // --- Delete Handlers ---
    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            const res = await fetch(`/api/services/${shopId}?serviceId=${serviceId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                loadServices();
            } else {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                alert(`Failed to delete service: ${err.error || res.statusText}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error deleting service: ${e.message}`);
        }
    };

    const handleDeleteCoupon = async (couponId: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`/api/coupons?id=${couponId}&shopId=${shopId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                loadCoupons();
            } else {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                alert(`Failed to delete coupon: ${err.error || res.statusText}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error deleting coupon: ${e.message}`);
        }
    };

    const handleSave = async () => {
        if (!shop) return;
        setSaving(true);
        try {
            const { services, coupons, reviews, ...shopData } = shop;
            const payload = { ...shopData, images: images };

            const res = await fetch(`/api/shops/${shopId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Shop information updated successfully!');
                loadShop();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const getL = (val: any) => typeof val === 'string' ? val : val?.en || '';

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!shop) return <div className="p-8 text-center text-gray-500">Shop not found.</div>;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#111', marginBottom: 4 }}>Shop Information</h2>
                    <p style={{ color: '#666' }}>Manage shop details, services, and coupons.</p>
                </div>
                <Button onClick={handleSave} disabled={saving || uploading} size="lg">
                    {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                    Save Changes
                </Button>
            </div>

            <div style={{ display: 'grid', gap: 32 }}>

                {/* Section 1: Basic Info */}
                <section style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}><Info className="mr-2" size={20} /> Basic Information</h3>
                    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
                        <div>
                            <label style={labelStyle}>Shop Name (English)</label>
                            <input style={inputStyle} value={getL(shop.name)} onChange={(e) => handleInputChange('name.en', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select style={inputStyle} value={shop.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                                    <option value="Hair">Hair</option>
                                    <option value="Nail">Nail</option>
                                    <option value="Massage">Massage</option>
                                    <option value="Makeup">Makeup</option>
                                    <option value="Spa">Spa</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input style={inputStyle} value={shop.contact_phone || ''} onChange={(e) => handleInputChange('contact_phone', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Description (English)</label>
                            <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} value={getL(shop.description)} onChange={(e) => handleInputChange('description.en', e.target.value)} />
                        </div>
                        {/* Address/Region */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                            <div>
                                <label style={labelStyle}>Region</label>
                                <input style={inputStyle} value={getL(shop.region)} onChange={(e) => handleInputChange('region.en', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Address</label>
                                <input style={inputStyle} value={getL(shop.address)} onChange={(e) => handleInputChange('address.en', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Visuals */}
                <section style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}><ImageIcon className="mr-2" size={20} /> Visuals</h3>
                    <div style={{ padding: 24 }}>
                        {/* Main Cover - Fixed Aspect Ratio (3.5:2 approx, slightly wider than 4:3) */}
                        <div style={{ marginBottom: 32 }}>
                            <label style={labelStyle}>Main Cover Image (Search Result Preview)</label>
                            <p style={helperTextStyle}>This image will be shown in search results.</p>
                            <div style={{
                                marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 12,
                                overflow: 'hidden', width: '100%', maxWidth: '400px', aspectRatio: '280 / 220',
                                position: 'relative', background: '#f9fafb'
                            }}>
                                {shop.image_url ? (
                                    <>
                                        <img src={shop.image_url} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button onClick={() => handleInputChange('image_url', null)} style={removeBtnStyle}><X size={16} /></button>
                                    </>
                                ) : (
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', cursor: 'pointer' }}>
                                        <Upload size={32} className="mb-2 text-gray-400" />
                                        <span className="text-sm text-gray-500">Upload Cover</span>
                                        <input type="file" hidden onChange={handleSingleImageUpload} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Gallery */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <label style={labelStyle}>Gallery Images</label>
                                <label style={addBtnStyle}>
                                    <Plus size={16} /> Add Photos
                                    <input type="file" hidden multiple onChange={handleMultiImageUpload} accept="image/*" />
                                </label>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                                {images.map((img, idx) => (
                                    <div key={idx} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button onClick={() => removeGalleryImage(idx)} style={removeBtnStyle}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Services */}
                <section style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}><Clock className="mr-2" size={20} /> Services Menu</h3>
                    <div style={{ padding: 24 }}>
                        {/* List */}
                        <div style={{ display: 'grid', gap: 12 }}>
                            {services.map((svc: any) => (
                                <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: '#f8f9fa', borderRadius: 8, alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{getL(svc.name)}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{svc.duration_min} mins • ₩{svc.price.toLocaleString()}</div>
                                    </div>
                                    <Trash2 size={16} style={{ cursor: 'pointer', color: '#dc3545' }} onClick={() => handleDeleteService(svc.id)} />
                                </div>
                            ))}
                            {services.length === 0 && <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>No services added yet.</div>}
                        </div>

                        {/* Add Logic */}
                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Service Name</label>
                                    <input style={inputStyle} placeholder="Service Name" value={newService.name.en} onChange={e => setNewService({ ...newService, name: { en: e.target.value } })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Duration (min)</label>
                                    <input type="number" style={inputStyle} value={newService.durationMin} onChange={e => setNewService({ ...newService, durationMin: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Price (₩)</label>
                                    <input
                                        type="number"
                                        style={inputStyle}
                                        value={newService.price}
                                        onChange={e => setNewService({ ...newService, price: e.target.value === '' ? '' : Number(e.target.value) })}
                                    />
                                </div>
                                <Button onClick={handleAddService} disabled={addingService} size="sm">
                                    <Plus size={16} /> Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Coupons */}
                <section style={sectionStyle}>
                    <h3 style={sectionHeaderStyle}><Tag className="mr-2" size={20} /> Coupons</h3>
                    <div style={{ padding: 24 }}>
                        {/* List */}
                        <div style={{ display: 'grid', gap: 12 }}>
                            {coupons.map((cp: any) => (
                                <div key={cp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: '#fff0f6', borderRadius: 8, alignItems: 'center', border: '1px solid #ffd6e7' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#c41d7f' }}>{cp.code}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            {cp.discount_type === 'percent' ? `${cp.discount_value}% OFF` : `₩${cp.discount_value.toLocaleString()} OFF`}
                                            • Valid until {cp.valid_until.split('T')[0]}
                                        </div>
                                    </div>
                                    <Trash2 size={16} style={{ cursor: 'pointer', color: '#dc3545' }} onClick={() => handleDeleteCoupon(cp.id)} />
                                </div>
                            ))}
                            {coupons.length === 0 && <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>No active coupons.</div>}
                        </div>

                        {/* Add Logic */}
                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Code</label>
                                    <input style={inputStyle} placeholder="SUMMER2025" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Type</label>
                                    <select style={inputStyle} value={newCoupon.discountType} onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })}>
                                        <option value="percent">% Percent</option>
                                        <option value="fixed">Fixed</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Value</label>
                                    <input type="number" style={inputStyle} value={newCoupon.discountValue} onChange={e => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }}>Expiry</label>
                                    <input type="date" style={inputStyle} value={newCoupon.validUntil} onChange={e => setNewCoupon({ ...newCoupon, validUntil: e.target.value })} />
                                </div>
                                <Button onClick={handleAddCoupon} disabled={addingCoupon} size="sm">
                                    <Plus size={16} /> Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

// Inline Styles (Simplified)
const sectionStyle: React.CSSProperties = { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const sectionHeaderStyle: React.CSSProperties = { background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', fontSize: '1rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' };
const helperTextStyle: React.CSSProperties = { fontSize: '0.85rem', color: '#6b7280', marginBottom: 0 };
const removeBtnStyle: React.CSSProperties = { position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', cursor: 'pointer', color: '#dc3545' };
const addBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#fff0f6', color: '#c41d7f', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 };
