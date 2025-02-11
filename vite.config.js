import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_CONTRACT_ADDRESS': JSON.stringify(env.REACT_APP_CONTRACT_ADDRESS),
      'process.env.REACT_APP_ALCHEMY_URL': JSON.stringify(env.REACT_APP_ALCHEMY_URL)
    },
    plugins: [react()],
  }
})