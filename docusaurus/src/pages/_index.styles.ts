import styled, { keyframes } from 'styled-components'
import Link from '@docusaurus/Link'

/**
 * 色彩系统
 */
const COLORS = {
  primary: '#39C5BB',
  skyBlue: '#7EC8E3',
  coral: '#F78DA7',
  lavender: '#B8A9F3',
  glowPink: 'rgba(247, 141, 167, 0.15)',
  glowPurple: 'rgba(184, 169, 243, 0.15)',
  glowGreen: 'rgba(57, 197, 187, 0.15)',
  glassBg: 'rgba(255, 255, 255, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.35)',
} as const

/**
 * 背景渐变流动动画
 */
const gradientFlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

/**
 * 光晕脉动动画
 */
const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.08);
  }
`

/**
 * 光晕漂移动画1
 */
const glowDrift1 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  25% {
    translate: 150px 200px;
  }
  50% {
    translate: -80px 350px;
  }
  75% {
    translate: 120px 150px;
  }
`

/**
 * 光晕漂移动画2
 */
const glowDrift2 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  30% {
    translate: -150px 100px;
  }
  60% {
    translate: 80px -150px;
  }
  80% {
    translate: -80px 80px;
  }
`

/**
 * 光晕漂移动画3
 */
const glowDrift3 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  20% {
    translate: 180px -80px;
  }
  50% {
    translate: -100px 220px;
  }
  75% {
    translate: 80px -120px;
  }
`

/**
 * 光晕漂移动画4
 */
const glowDrift4 = keyframes`
  0%, 100% {
    translate: 0 0;
  }
  35% {
    translate: -130px -100px;
  }
  65% {
    translate: 100px 140px;
  }
  85% {
    translate: -60px -60px;
  }
`

/**
 * 内容渐入动画
 */
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

/**
 * 页面根容器
 */
export const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  background: #ffffff;
`

/**
 * 滚动区域包装器
 */
export const ScrollSection = styled.div`
  position: relative;
  min-height: 100vh;
`

/**
 * 背景渐变层
 */
export const BackgroundLayer = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(
    -45deg,
    rgba(57, 197, 187, 0.08),
    rgba(184, 169, 243, 0.06),
    rgba(247, 141, 167, 0.05),
    rgba(57, 197, 187, 0.06),
    rgba(184, 169, 243, 0.08)
  );
  background-size: 400% 400%;
  animation: ${gradientFlow} 20s ease infinite;
  z-index: 0;
`

/**
 * 光晕球体1 - 左上角绿色
 */
export const GlowOrb1 = styled.div`
  position: fixed;
  width: 600px;
  height: 600px;
  top: -8%;
  left: -5%;
  background: radial-gradient(
    circle,
    ${COLORS.glowGreen} 0%,
    rgba(57, 197, 187, 0.08) 45%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  filter: blur(40px);
  animation:
    ${glowPulse} 6s ease-in-out infinite,
    ${glowDrift1} 25s ease-in-out infinite;
`

/**
 * 光晕球体2 - 右上角紫色
 */
export const GlowOrb2 = styled.div`
  position: fixed;
  width: 600px;
  height: 600px;
  top: -8%;
  right: -5%;
  background: radial-gradient(
    circle,
    ${COLORS.glowPurple} 0%,
    rgba(184, 169, 243, 0.08) 45%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  filter: blur(40px);
  animation:
    ${glowPulse} 8s ease-in-out infinite,
    ${glowDrift2} 30s ease-in-out infinite;
  animation-delay: 2s;
`

/**
 * 光晕球体3 - 中间偏左粉色
 */
export const GlowOrb3 = styled.div`
  position: fixed;
  width: 550px;
  height: 550px;
  top: 40%;
  left: -8%;
  background: radial-gradient(
    circle,
    ${COLORS.glowPink} 0%,
    rgba(247, 141, 167, 0.08) 45%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  filter: blur(35px);
  animation:
    ${glowPulse} 7s ease-in-out infinite,
    ${glowDrift3} 22s ease-in-out infinite;
  animation-delay: 1s;
`

/**
 * 光晕球体4 - 中间偏右紫色
 */
export const GlowOrb4 = styled.div`
  position: fixed;
  width: 550px;
  height: 550px;
  top: 45%;
  right: -8%;
  background: radial-gradient(
    circle,
    ${COLORS.glowPurple} 0%,
    rgba(184, 169, 243, 0.08) 45%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  filter: blur(35px);
  animation:
    ${glowPulse} 9s ease-in-out infinite,
    ${glowDrift4} 28s ease-in-out infinite;
  animation-delay: 3s;
`

/**
 * Hero 区域容器
 */
export const HeroSection = styled.header`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 80px 20px;
  z-index: 2;
`

/**
 * Hero 内容容器 - 玻璃态卡片
 */
export const HeroContent = styled.div`
  max-width: 800px;
  width: 100%;
  padding: 50px 40px;
  background: ${COLORS.glassBg};
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border-radius: 32px;
  border: 1px solid ${COLORS.glassBorder};
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 16px 64px rgba(57, 197, 187, 0.12);
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(57, 197, 187, 0.3),
      rgba(184, 169, 243, 0.2),
      rgba(247, 141, 167, 0.15)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.5;
  }
`

/**
 * Hero 标题
 */
export const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #2d9e96 0%, #39c5bb 50%, #45e0d5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 40px;
  }
`

/**
 * Hero 副标题
 */
export const HeroSubtitle = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: #4a5568;
  margin: 0 0 40px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`

/**
 * Hero 按钮
 */
export const HeroButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #39c5bb 0%, #2d9e96 100%);
  border: none;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 16px rgba(57, 197, 187, 0.25),
    0 8px 32px rgba(57, 197, 187, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 6px 24px rgba(57, 197, 187, 0.35),
      0 12px 48px rgba(57, 197, 187, 0.25);
    color: #ffffff;

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`

/**
 * 特性展示区容器
 */
export const FeaturesSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  z-index: 2;
`

/**
 * 特性标题区域
 */
export const FeaturesSectionTitle = styled.h2`
  font-size: 42px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 60px 0;
  background: linear-gradient(135deg, #2d9e96 0%, #39c5bb 50%, #45e0d5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 40px;
  }
`

/**
 * 特性列表容器
 */
export const FeatureList = styled.div`
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

/**
 * 特性卡片 - 横向布局
 */
export const FeatureCard = styled.div<{ $index: number }>`
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px;
  background: ${COLORS.glassBg};
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-radius: 20px;
  border: 1px solid ${COLORS.glassBorder};
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(57, 197, 187, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  animation: ${fadeInUp} 0.6s ease-out;
  animation-delay: ${(props) => props.$index * 0.1}s;
  animation-fill-mode: both;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(57, 197, 187, 0.2),
      rgba(184, 169, 243, 0.15),
      transparent
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.08),
      0 16px 48px rgba(57, 197, 187, 0.15);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    text-align: center;
  }
`

/**
 * 特性序号 - 大号渐变数字
 */
export const FeatureNumber = styled.div`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #39c5bb 0%, #7ec8e3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -10px;
    background: linear-gradient(135deg, rgba(57, 197, 187, 0.15), rgba(126, 200, 227, 0.08));
    border-radius: 50%;
    z-index: -1;
    transition: transform 0.3s ease;
  }

  ${FeatureCard}:hover &::after {
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 36px;
  }
`

/**
 * 特性内容区域
 */
export const FeatureContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

/**
 * 特性标题
 */
export const FeatureTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`

/**
 * 特性描述
 */
export const FeatureDescription = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #5a6c7d;
  margin: 0;
`
