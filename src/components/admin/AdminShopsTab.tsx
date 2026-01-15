'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, MapPin, Phone, CheckCircle, X, Image as ImageIcon, Upload, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from '@/components/dashboard/OwnerDashboard.module.css';
import { CATEGORY_CONFIG } from '@/types';
import KakaoAddressSearch from '@/components/features/KakaoAddressSearch';

export default function AdminShopsTab() {
    const [shops, setShops] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Register Form State
    const [formData, setFormData] = useState<any>({
        mainCategory: 'k-beauty',
        subCategory: 'hair'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const businessLicenseRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadShops();
        loadOwners();
    }, []);

    const loadShops = async () => {
        try {
            const res = await fetch('/api/admin/shops');
            if (res.ok) {
                const data = await res.json();
                setShops(data.shops || []);
            }
        } catch (error) {
            console.error('Failed to load shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOwners = async () => {
        try {
            const res = await fetch('/api/admin/users?role=owner');
            if (res.ok) {
                const data = await res.json();
                setOwners(data.users || []);
            }
        } catch (error) {
            console.error('Failed to load owners:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'businessLicenseUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = new FormData();
            data.append('file', file);
            data.append('folder', field === 'imageUrl' ? 'shops' : 'documents');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                const result = await res.json();
                setFormData((prev: any) => ({ ...prev, [field === 'imageUrl' ? 'image_url' : 'business_license_url']: result.url }));
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    const handleRegister = async () => {
        // Validation
        if (!formData.nameEn) {
            alert('Shop Name is required');
            return;
        }

        try {
            const payload = {
                name: { en: formData.nameEn },
                description: { en: formData.descriptionEn || '' },
                address: { en: formData.addressEn || '' },
                region: { en: formData.regionEn || 'Seoul' },
                main_category: formData.mainCategory,
                sub_category: formData.subCategory || null,
                owner_id: formData.ownerId || null,
                contact_phone: formData.contactPhone || '',
                business_number: formData.businessNumber || '',
                representative_name: formData.representativeName || '',
                business_license_url: formData.business_license_url || null,
                bank_name: formData.bankName || '',
                bank_account: formData.bankAccount || '',
                bank_holder: formData.bankHolder || '',
                image_url: formData.image_url || null,
                // Coordinates (will be set later with geocoding)
                latitude: formData.latitude || null,
                longitude: formData.longitude || null,
                road_address: formData.roadAddress || null,
                postal_code: formData.postalCode || null
            };

            const res = await fetch('/api/admin/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Shop registered successfully!');
                setShowRegisterModal(false);
                setFormData({ mainCategory: 'k-beauty', subCategory: 'hair' }); // Reset
                loadShops();
            } else {
                const err = await res.json();
                alert(`Registration failed: ${err.error}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed');
        }
    };

    const getL = (val: any) => typeof val === 'string' ? val : val?.en || '';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem' }}>Shops Management</h2>
                <Button onClick={() => setShowRegisterModal(true)}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Register Shop
                </Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {shops.map(shop => (
                        <div key={shop.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, background: 'white' }}>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f5f5f5', overflow: 'hidden' }}>
                                    {shop.image_url ? (
                                        <img src={shop.image_url} alt={getL(shop.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="#ccc" /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{getL(shop.name)}</h3>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{shop.category} • {getL(shop.region)}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666', borderTop: '1px solid #f0f0f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> {shop.contact_phone || '-'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={12} color={shop.business_license_url ? 'green' : '#ccc'} />
                                    {shop.business_license_url ? 'Documents Uploaded' : 'Missing Documents'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Register Modal */}
            {showRegisterModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white', borderRadius: 16, padding: 24,
                        width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.4rem' }}>Register New Shop</h2>
                            <button onClick={() => setShowRegisterModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            {/* Left Column: Basic Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <h3 style={{ fontSize: '1rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Basic Info</h3>

                                {/* Image Upload */}
                                <div style={{
                                    width: '100%', aspectRatio: '16/9',
                                    background: '#f5f5f5', borderRadius: 8, overflow: 'hidden',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                                    cursor: 'pointer', border: '2px dashed #ddd'
                                }} onClick={() => fileInputRef.current?.click()}>
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <Upload size={24} color="#999" style={{ marginBottom: 8 }} />
                                            <span style={{ fontSize: '0.9rem', color: '#999' }}>Upload Shop Image</span>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'imageUrl')} accept="image/*" />
                                </div>

                                {/* Owner Selection */}
                                <div className={styles.inputGroup}>
                                    <label><User size={14} style={{ marginRight: 4 }} /> Assign Owner (Optional)</label>
                                    <select name="ownerId" value={formData.ownerId || ''} onChange={handleInputChange} className={styles.select}>
                                        <option value="">-- No Owner (Assign Later) --</option>
                                        {owners.map((owner: any) => (
                                            <option key={owner.id} value={owner.id}>
                                                {owner.name || owner.email} ({owner.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Shop Name (EN) *</label>
                                    <input name="nameEn" value={formData.nameEn || ''} onChange={handleInputChange} className={styles.input} placeholder="e.g., Jenny House Premium" required />
                                </div>

                                {/* Category Selection */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className={styles.inputGroup}>
                                        <label>Main Category *</label>
                                        <select
                                            name="mainCategory"
                                            value={formData.mainCategory || 'k-beauty'}
                                            onChange={(e) => {
                                                const mainCat = e.target.value;
                                                const config = CATEGORY_CONFIG[mainCat as keyof typeof CATEGORY_CONFIG];
                                                const firstSub = config?.subcategories?.[0] || '';
                                                setFormData((prev: any) => ({
                                                    ...prev,
                                                    mainCategory: mainCat,
                                                    subCategory: firstSub
                                                }));
                                            }}
                                            className={styles.select}
                                        >
                                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Sub Category</label>
                                        <select
                                            name="subCategory"
                                            value={formData.subCategory || ''}
                                            onChange={handleInputChange}
                                            className={styles.select}
                                            disabled={!CATEGORY_CONFIG[formData.mainCategory as keyof typeof CATEGORY_CONFIG]?.subcategories?.length}
                                        >
                                            <option value="">-- None --</option>
                                            {CATEGORY_CONFIG[formData.mainCategory as keyof typeof CATEGORY_CONFIG]?.subcategories?.map((sub: string) => (
                                                <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Region</label>
                                    <select name="regionEn" value={formData.regionEn || 'Seoul'} onChange={handleInputChange} className={styles.select}>
                                        <option value="Seoul">Seoul</option>
                                        <option value="Busan">Busan</option>
                                        <option value="Incheon">Incheon</option>
                                        <option value="Daegu">Daegu</option>
                                        <option value="Daejeon">Daejeon</option>
                                        <option value="Gwangju">Gwangju</option>
                                        <option value="Ulsan">Ulsan</option>
                                        <option value="Jeju">Jeju</option>
                                    </select>
                                </div>

                                {/* Location Section */}
                                <div className={styles.inputGroup}>
                                    <label style={{ marginBottom: 8 }}>📍 Location (Address & Map)</label>
                                    <KakaoAddressSearch
                                        onAddressSelect={(data) => {
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                addressEn: data.roadAddress,
                                                roadAddress: data.roadAddress,
                                                postalCode: data.zonecode,
                                                latitude: data.latitude,
                                                longitude: data.longitude
                                            }));
                                        }}
                                        showMap={true}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Detail Address (상세주소)</label>
                                    <input
                                        name="detailAddress"
                                        value={formData.detailAddress || ''}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="e.g., 2층 201호"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Description (EN)</label>
                                    <textarea name="descriptionEn" value={formData.descriptionEn || ''} onChange={handleInputChange} className={styles.input} rows={3} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Contact Phone</label>
                                    <input name="contactPhone" value={formData.contactPhone || ''} onChange={handleInputChange} className={styles.input} />
                                </div>
                            </div>

                            {/* Right Column: Business Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <h3 style={{ fontSize: '1rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Business Details</h3>

                                <div className={styles.inputGroup}>
                                    <label>Business Number</label>
                                    <input name="businessNumber" value={formData.businessNumber || ''} onChange={handleInputChange} className={styles.input} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Representative Name</label>
                                    <input name="representativeName" value={formData.representativeName || ''} onChange={handleInputChange} className={styles.input} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Bank Name</label>
                                    <input name="bankName" value={formData.bankName || ''} onChange={handleInputChange} className={styles.input} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Account Number</label>
                                    <input name="bankAccount" value={formData.bankAccount || ''} onChange={handleInputChange} className={styles.input} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Account Holder</label>
                                    <input name="bankHolder" value={formData.bankHolder || ''} onChange={handleInputChange} className={styles.input} />
                                </div>

                                <div className={styles.inputGroup} style={{ marginTop: 16 }}>
                                    <label>Business Documents</label>
                                    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#666' }}>Upload Business License</p>
                                        <input type="file" ref={businessLicenseRef} style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'businessLicenseUrl')} />
                                        <Button size="sm" variant="outline" fullWidth onClick={() => businessLicenseRef.current?.click()}>
                                            <Upload size={14} style={{ marginRight: 6 }} />
                                            {formData.business_license_url ? 'Change File' : 'Select File'}
                                        </Button>
                                        {formData.business_license_url && (
                                            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'green', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCircle size={12} /> Uploaded Successfully
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Button variant="outline" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
                            <Button onClick={handleRegister} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Register Shop'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
