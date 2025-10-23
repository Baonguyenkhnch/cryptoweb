import { build } from 'vite';
import react from '@vitejs/plugin-react-swc';

const config = {
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
};

try {
  await build(config);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
