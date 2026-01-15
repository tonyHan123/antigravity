'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

declare global {
    interface Window {
        daum: any;
        kakao: any;
    }
}

interface AddressData {
    roadAddress: string;
    jibunAddress: string;
    zonecode: string; // postal code
    latitude?: number;
    longitude?: number;
}

interface KakaoAddressSearchProps {
    onAddressSelect: (data: AddressData) => void;
    initialAddress?: string;
    showMap?: boolean;
}

export default function KakaoAddressSearch({ onAddressSelect, initialAddress, showMap = true }: KakaoAddressSearchProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [address, setAddress] = useState(initialAddress || '');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // Load Kakao scripts
    useEffect(() => {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
        if (!kakaoKey) {
            console.error('NEXT_PUBLIC_KAKAO_MAP_KEY is not set');
            return;
        }

        // Load Daum Postcode script
        const loadDaumPostcode = () => {
            return new Promise<void>((resolve) => {
                if (window.daum?.Postcode) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        };

        // Load Kakao Maps script
        const loadKakaoMaps = () => {
            return new Promise<void>((resolve) => {
                if (window.kakao?.maps) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`;
                script.onload = () => {
                    window.kakao.maps.load(() => {
                        resolve();
                    });
                };
                document.head.appendChild(script);
            });
        };

        Promise.all([loadDaumPostcode(), loadKakaoMaps()]).then(() => {
            setScriptsLoaded(true);
        });
    }, []);

    // Initialize map when scripts are loaded
    useEffect(() => {
        if (!scriptsLoaded || !showMap || !mapContainerRef.current) return;

        const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.9780); // Seoul

        mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
            center: coordinates
                ? new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng)
                : defaultCenter,
            level: 3
        });

        markerRef.current = new window.kakao.maps.Marker({
            position: coordinates
                ? new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng)
                : defaultCenter,
            map: mapRef.current,
            draggable: true // Allow drag to fine-tune position
        });

        // Update coordinates when marker is dragged
        window.kakao.maps.event.addListener(markerRef.current, 'dragend', () => {
            const position = markerRef.current.getPosition();
            const newCoords = { lat: position.getLat(), lng: position.getLng() };
            setCoordinates(newCoords);
            onAddressSelect({
                roadAddress: address,
                jibunAddress: '',
                zonecode: '',
                latitude: newCoords.lat,
                longitude: newCoords.lng
            });
        });
    }, [scriptsLoaded, showMap]);

    // Update map when coordinates change
    useEffect(() => {
        if (!mapRef.current || !markerRef.current || !coordinates) return;

        const position = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng);
        mapRef.current.setCenter(position);
        markerRef.current.setPosition(position);
    }, [coordinates]);

    // Open Daum Postcode search popup
    const handleOpenSearch = () => {
        if (!window.daum?.Postcode) {
            alert('주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: async (data: any) => {
                const roadAddr = data.roadAddress || data.jibunAddress;
                setAddress(roadAddr);

                // Geocode the address
                setLoading(true);
                try {
                    const res = await fetch('/api/geocode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address: roadAddr })
                    });

                    if (res.ok) {
                        const result = await res.json();
                        const coords = { lat: result.latitude, lng: result.longitude };
                        setCoordinates(coords);

                        onAddressSelect({
                            roadAddress: roadAddr,
                            jibunAddress: data.jibunAddress || '',
                            zonecode: data.zonecode || '',
                            latitude: coords.lat,
                            longitude: coords.lng
                        });
                    } else {
                        console.error('Geocoding failed');
                        onAddressSelect({
                            roadAddress: roadAddr,
                            jibunAddress: data.jibunAddress || '',
                            zonecode: data.zonecode || ''
                        });
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                } finally {
                    setLoading(false);
                }
            }
        }).open();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Search Button & Address Display */}
            <div style={{ display: 'flex', gap: 8 }}>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenSearch}
                    disabled={!scriptsLoaded}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    <Search size={14} style={{ marginRight: 4 }} />
                    {scriptsLoaded ? '주소 검색' : '로딩 중...'}
                </Button>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="클릭하여 주소 검색"
                    readOnly
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        background: '#f9f9f9',
                        cursor: 'pointer'
                    }}
                    onClick={handleOpenSearch}
                />
            </div>

            {/* Coordinates Display */}
            {coordinates && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.8rem',
                    color: '#666',
                    padding: '6px 10px',
                    background: '#f0f9ff',
                    borderRadius: 4
                }}>
                    <MapPin size={14} />
                    <span>위도: {coordinates.lat.toFixed(6)}, 경도: {coordinates.lng.toFixed(6)}</span>
                    {loading && <span style={{ marginLeft: 8, color: '#999' }}>좌표 변환 중...</span>}
                </div>
            )}

            {/* Map Preview */}
            {showMap && (
                <div
                    ref={mapContainerRef}
                    style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 8,
                        background: '#f0f0f0',
                        display: scriptsLoaded ? 'block' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {!scriptsLoaded && <span style={{ color: '#999' }}>지도 로딩 중...</span>}
                </div>
            )}

            {coordinates && (
                <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
                    💡 핀을 드래그하여 정확한 위치로 조정할 수 있습니다
                </p>
            )}
        </div>
    );
}
