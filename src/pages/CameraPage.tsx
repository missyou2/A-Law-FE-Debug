import '../App.css'
import { useNavigate } from 'react-router-dom';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { ImTextColor } from 'react-icons/im';

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '19px 24px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as const,
  title: {
    fontSize: '34px',
    fontWeight: '530',
    width:'100%',
    textAlign: 'left',
    marginBottom: '40px',
    lineHeight: '1.3',
    color: '#1a1a1aff',
  } as const,

  // 돌아가기
  backLink: {
    marginTop: 'auto',
    marginBottom: '20px',
    color: '#3d3d3dff',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    marginRight:'auto',
    alignItems: 'center',
    gap: '5px',
  },

    buttonBase: {
    width: '80%',
    maxWidth: '350px',
    padding: '20px 20px',
    borderRadius: '20px',
    fontSize: '20px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    cursor: 'pointer',
    marginBottom: '20px',
    backgroundImage: 'linear-gradient(to right, #21D8FC, #5865B9)', 
    textShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
    color:'white',
    border: 'none',
  },
};

const CameraPage: React.FC = () => {
    // 비디오 접근용
    const videoRef = useRef<HTMLVideoElement>(null);
    // 캔버스(캡쳐용)
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [capturedImage, setCapturedImage] = useState<string|null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            if (capturedImage) return;
            try {
                const constraints: MediaStreamConstraints = {
                    audio: false,
                    video: {
                        width: 720,
                        height: 1280
                    }
                };

                stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setError(null); 
                    setIsCameraActive(true);
                }
            } catch (err) {
                console.error("카메라 접근 오류:", err);
                setError(`카메라 접근에 실패했습니다: ${(err as Error).name || '알 수 없는 오류'}`);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [capturedImage]);

    // 촬영하기
    const takePicture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video && canvas && isCameraActive && !capturedImage) {
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                setError("비디오 스트림이 유효하지 않습니다.");
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/png'); 
                
                setCapturedImage(dataUrl);

                const stream = video.srcObject as MediaStream;
                if (stream){
                    stream.getTracks().forEach(track => track.stop());
                }

                navigate('/capturedResult', {state:{capturedImageData: dataUrl}});
            }
        }
    }, [isCameraActive, capturedImage, navigate]);

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>
             계약서를<br/>촬영해 주세요.
            </h1>
            {error && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                    {error}
                </p>
            )}
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 0 20px 0' }}>
                 <video
                    ref={videoRef}
                    style={{ 
                        width: '80%', 
                        border: '2px solid #333', 
                        borderRadius: '10px',
                        display: capturedImage ? 'none' : 'block',
                        
                        margin: '0 auto', // 가운데정렬
                    }}
                    playsInline
                    autoPlay
                />
                {!isCameraActive && !error && <p>카메라 스트림이 로드되는 중입니다...</p>}
            </div>
            {/* 4. 촬영 버튼 (한 번만 노출) */}
            {!capturedImage && !error && isCameraActive && (
                <button 
                    onClick={takePicture}
                    style={styles.buttonBase}
                >
                    촬영하기
                </button>
            )}

            {/* 5. 캡처에 사용될 숨겨진 캔버스 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* 4. 이전으로 돌아가기 링크 */}
                <div 
                    style={styles.backLink}
                    onClick={() => navigate('/scan')}
                >
                    <FaArrowLeft size={10} />
                    이전으로 돌아가기
            </div>
        </div>
    );
};

export default CameraPage;