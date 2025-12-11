import '../../App.css'

import { useNavigate } from 'react-router-dom';
import AlbumIcon from '../../assets/icons/album.png';
import CameraIcon from '../../assets/icons/camera.png';
import { FaArrowLeft } from 'react-icons/fa';


const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '40px 24px',
    maxWidth: '400px',
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
    marginBottom: '100px',
    lineHeight: '1.3',
    color: '#1a1a1aff',
  } as const,

  buttonBase: {
    width: '100%',
    maxWidth: '350px',
    padding: '30px 20px',
    borderRadius: '20px',
    fontSize: '20px',
    fontWeight: 'medium',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    cursor: 'pointer',
    marginBottom: '20px',
    textShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
  },

  // 촬영하기
  captureButton: {
    color: 'white',
    backgroundImage: 'linear-gradient(to right, #21D8FC, #5865B9)', 
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
    fontWeight: '600',
  },
  
  // 불러오기
  albumButton: {
    backgroundColor: 'white',
    color: '#181818ff',
    border: '1px solid #ddd',
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
  },

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
  }
};

const ScanPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 1. 상단 문구 */}
      <h1 style={styles.title}>
        계약서 분석에<br/>실패했습니다.
      </h1>

      {/* 2. 지금 바로 촬영하기 버튼 */}
      <div 
        style={{...styles.buttonBase, ...styles.captureButton}}
        className="hover-scale-effect"
        onClick={() => { alert('카메라 실행') }}
      >
        <img src={CameraIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        다시 촬영하기
      </div>

      {/* 3. 앨범에서 불러오기 버튼 */}
      <div 
        style={{...styles.buttonBase, ...styles.albumButton}}
        onClick={() => { alert('앨범 열기') }}
      >
        <img src={AlbumIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        앨범에서 불러오기
      </div>

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

export default ScanPage;