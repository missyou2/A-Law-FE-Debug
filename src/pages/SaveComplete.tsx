import { useNavigate } from 'react-router-dom';
import CheckboxIcon from '../assets/icons/checkbox.png'

const styles = {
  container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '40px 24px',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as const,
  title: {
    fontSize: '34px',
    fontWeight: '530',
    width:'100%',
    textAlign: 'left',
    marginBottom: '20px',
    lineHeight: '1.3',
    color: '#1a1a1aff',
  } as const,

  loadingArea:{
    flexGrow: 1,
    marginTop:'80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
  }as const,
  loadingText:{
    marginTop: '25px',
    fontSize: '20px',
    fontWeight: '500',
    color: '#111111ff',
    lineHeight:'1.5'
  },

  returnHome:{
    backgroundColor:'white',
    padding: '10px 70px',
    borderRadius: '30px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'cneter',
    alignItems:'center',
    boxShadow: '0 4px 10px rgba(143, 143, 143, 0.8)',
    cursor: 'pointer',
    width: 'auto',
    marginBottom:'180px',
  }as const,

  returnHomeText:{
    fontSize: '18px',
    width:'100%',
    textAlign: 'center',
    color: 'black',
  }as const,
};

const SaveComplete = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 1. 상단 문구 */}
      <h1 style={styles.title}>
        저장 완료!
      </h1>

      <div style={styles.loadingArea}>
        <img src={CheckboxIcon} style={{width:'36px', height:'36px'}} />
        <p style={styles.loadingText}>
            저장한 계약서는 언제든<br/>홈 화면 &gt; 마이 메뉴 &gt; 내 계약서에서<br/>확인할 수 있어요.
        </p>
      </div>

      <div style={styles.returnHome}
        onClick={() => navigate('/')}
        >
        <div style={styles.returnHomeText}>홈 화면으로</div>
      </div>
    </div>
  );
};

export default SaveComplete