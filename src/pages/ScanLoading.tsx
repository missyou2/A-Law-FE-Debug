import '../App.css'

import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingIcon from '../assets/icons/loading.png'

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
    width:'100%',
    textAlign: 'left',
    marginBottom: '100px',
    lineHeight: '1.3',
    color: '#1a1a1aff',
  } as const,

  loadingArea:{
    flexGrow:1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '200px',
  } as const,
  loadingText:{
    marginTop: '25px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#111111ff',
    textShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
  },
  spinnerIcon:{
    fontSize: '80px'
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
        계약서를<br/>읽고 있습니다.
      </h1>

      <div style={styles.loadingArea}>
        <img src={LoadingIcon} style={{width:'60px', height:'60px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4))'}} />
        <p style={styles.loadingText}>
            선거와 국민투표의 공정한 관리 및 정당에 관한 사무를 처리하기 위하여 선거관리위원회를 둔다. 누구든지 체포 또는 구속을 당한 때에는 적부의 심사를 법원에 청구할 권리를 가진다.        </p>
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