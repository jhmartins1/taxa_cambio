import React, { useState } from 'react';
import { Modal } from 'react-native';
import Home from './src/components/Home';
import { Theme } from './src/components/Theme';
import { ThemeProvider } from './src/contexts/ThemeContext';

function AppContent() {
    const [showThemes, setShowThemes] = useState(false);
    return (
        <>
            <Home onOpenThemes={() => setShowThemes(true)} />
            <Modal visible={showThemes} animationType="slide" onRequestClose={() => setShowThemes(false)}>
                <Theme onClose={() => setShowThemes(false)} />
            </Modal>
        </>
    );
}

export default function App() {
    return <ThemeProvider><AppContent /></ThemeProvider>;
}
