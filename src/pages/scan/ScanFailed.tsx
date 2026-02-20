import '../../App.css'
import './scan.css'

import { useNavigate, useLocation } from 'react-router-dom';
import AlbumIcon from '../../assets/icons/album.png';
import CameraIcon from '../../assets/icons/camera.png';
import { FaArrowLeft } from 'react-icons/fa';

type ErrorReason = 'server_error' | 'invalid_format' | 'ocr_error';

const ERROR_MESSAGES: Record<ErrorReason, { title: string; description: string }> = {
  server_error: {
    title: '서버 오류',
    description: '서버와 연결하는 데 문제가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
  },
  invalid_format: {
    title: '지원하지 않는 파일 형식',
    description: 'JPG, PNG 형식의 이미지만 업로드할 수 있습니다.\n다른 파일을 선택해 주세요.',
  },
  ocr_error: {
    title: '텍스트 인식 실패',
    description: '계약서의 텍스트를 인식하지 못했습니다.\n더 선명한 이미지로 다시 시도해 주세요.',
  },
};

const ScanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorReason = (location.state?.errorReason as ErrorReason) ?? 'server_error';
  const { title, description } = ERROR_MESSAGES[errorReason] ?? ERROR_MESSAGES.server_error;

  return (
    <div className="scan-container scan-container--failed">
      {/* 1. 상단 문구 */}
      <h1 className="scan-title">
        계약서 분석에<br/>실패했습니다.
      </h1>
      <div className="scan-error-reason">
        <p className="scan-error-title">{title}</p>
        <p className="scan-error-description">{description}</p>
      </div>

      {/* 2. 지금 바로 촬영하기 버튼 */}
      <div 
        className="btn-base btn-capture hover-scale-effect"
        onClick={() => { alert('카메라 실행') }}
      >
        <img src={CameraIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        다시 촬영하기
      </div>

      {/* 3. 앨범에서 불러오기 버튼 */}
      <div 
        className="btn-base btn-album"
        onClick={() => { alert('앨범 열기') }}
      >
        <img src={AlbumIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        앨범에서 불러오기
      </div>

      {/* 4. 이전으로 돌아가기 링크 */}
      <div 
        className="back-link"
        onClick={() => navigate('/scan')}
      >
        <FaArrowLeft size={10} />
        이전으로 돌아가기
      </div>
    </div>
  );
};

export default ScanPage;