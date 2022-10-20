import { MantineProvider, Text } from '@mantine/core';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS       
    theme={{
      colorScheme: 'dark',
    }} >
      <Dashboard />
    </MantineProvider>
  );
}