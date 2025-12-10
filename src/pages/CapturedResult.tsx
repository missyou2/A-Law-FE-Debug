import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';


interface LocationState {
    capturedImageData?: string;
}

const styles = {
    container: {
        backgroundColor: '#F1F2F6',
        minHeight: '100vh',
        padding: '40px 24px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    } as const,
    title: {
        fontSize: '34px',
        fontWeight: '530',
        width: '100%',
        textAlign: 'left',
        marginBottom: '20px',
        lineHeight: '1.3',
        color: '#1a1a1aff',
    } as const,
    backLink: {
        marginBottom: '20px',
        color: '#3d3d3dff',
        fontSize: '15px',
        cursor: 'pointer',
        display: 'flex',
        marginRight: 'auto',
        alignItems: 'center',
        gap: '5px',
    } as const,
    imageContainer: {
        width: '80%',
        maxWidth: '600px',
        border: '3px solid #007bff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    } as const,
    image: {
        width: '100%',
        align: '0 auto',
        display: 'block',
    } as const,
};

const CapturedResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const capturedImageData = (location.state as LocationState)?.capturedImageData || null;

    return (
        <div style={styles.container}>
            {/* 돌아가기 (다시 촬영) 링크 */}
            <div 
                style={styles.backLink}
                onClick={() => navigate('/scan')}
            >
                <FaArrowLeft size={10} />
                다시 촬영하기
            </div>

            <h1 style={styles.title}>
                촬영 결과<br/>테스트 페이지
            </h1>

            {/* 2. 캡처된 이미지 표시 */}
            {capturedImageData ? (
                <>
                    <div style={styles.imageContainer}>
                        <img 
                            src={capturedImageData} 
                            alt="Captured Document" 
                            style={styles.image}
                        />
                    </div>
                    
                    <p style={{ marginTop: '20px', color: '#131313ff', fontWeight: 'bold' }}>
                        계약서 캡쳐 완료!
                    </p>
                </>
            ) : (
                <div style={{ padding: '20px', border: '1px solid #dc3545', borderRadius: '10px', marginTop: '20px' }}>
                    <p style={{ color: '#dc3545', fontSize: '1.2em', fontWeight: 'bold' }}>
                        캡처된 이미지 데이터가 없습니다.
                    </p>
                    <p style={{ color: '#555', marginTop: '10px' }}>
                        카메라 페이지에서 촬영해주세요.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CapturedResult;