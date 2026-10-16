import React, { useRef, useEffect } from "react";
import { View, Animated } from "react-native";
import Svg, {
    Defs,
    LinearGradient,
    Stop,
    Circle,
    Path,
} from "react-native-svg";

interface BrandLogoProps {
    size?: number;
    showPing?: boolean;
}

export default function BrandLogo({ size = 64, showPing = true }: BrandLogoProps) {
    // Animação de pulso nativo (estilo animate-ping do Stitch)
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.8)).current;
    useEffect(() => {
        if (!showPing) return;
        const pulse = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 2.2,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.8,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, [showPing, scaleAnim, opacityAnim]);

    return (
        <View
            style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
                <Defs>
                    <LinearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#1E3A8A" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#1e40af" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Fundo Circular com Gradiente Azul Real */}
                <Circle cx="100" cy="100" r="90" fill="url(#blueGrad)" />

                {/* Bíblia Aberta */}
                <Path
                    d="M100 150V60C100 60 70 50 40 60V140C70 130 100 140 100 140ZM100 150V60C100 60 130 50 160 60V140C130 130 100 140 100 140Z"
                    fill="#ffffff"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeLinejoin="round"
                />

                {/* Símbolo de Interrogação / Coroa em Ouro */}
                <Path
                    d="M100 45C110 45 118 53 118 63C118 68 116 72 113 75L100 90V95"
                    stroke="#F59E0B"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />
                <Circle cx="100" cy="110" r="4" fill="#F59E0B" />
            </Svg>
            {/* Bolinha Dourada Pulsante (Stitch Ping Badge) */}
            {showPing && (
                <View
                    style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                    }}
                >
                    {/* Onda pulsante (efeito ping) */}
                    <Animated.View
                        style={{
                            position: "absolute",
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: "#fea619",
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        }}
                    />
                    {/* Bolinha central sólida com borda branca */}
                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#fea619",
                            borderWidth: 2,
                            borderColor: "#ffffff",
                        }}
                    />
                </View>
            )}
        </View>
    );
}
