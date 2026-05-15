import React, { useState } from 'react';
import styled from 'styled-components';
import { itemData, rarityConfig, typeConfig } from './data/items';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #e94560;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
  letter-spacing: 4px;
`;

const Subtitle = styled.p`
  color: #a0a0a0;
  margin-top: 10px;
  font-size: 1rem;
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilterGroup = styled.div`
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.span`
  color: #e0e0e0;
  font-weight: 500;
  margin-right: 15px;
  min-width: 60px;
  display: inline-block;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  margin: 0 8px 8px 0;
  border: 2px solid ${props => props.active ? props.color : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.active ? props.color + '20' : 'transparent'};
  color: ${props => props.active ? props.color : '#a0a0a0'};
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.color}10;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ItemCard = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => props.unlocked ? props.rarityColor : 'rgba(100, 100, 100, 0.3)'};
  position: relative;
  overflow: hidden;
  
  ${props => !props.unlocked && `
    filter: grayscale(100%);
    opacity: 0.6;
  `}
  
  ${props => props.unlocked && `
    box-shadow: 0 0 20px ${props.rarityColor}30;
  `}
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    ${props => props.unlocked && `
      box-shadow: 0 10px 40px ${props.rarityColor}50;
    `}
  }
`;

const ItemIcon = styled.div`
  font-size: 4rem;
  text-align: center;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  
  ${ItemCard}:hover & {
    transform: scale(1.1);
  }
`;

const ItemName = styled.h3`
  color: ${props => props.unlocked ? props.rarityColor : '#666'};
  text-align: center;
  margin: 0 0 10px 0;
  font-size: 1rem;
  font-weight: 600;
`;

const ItemType = styled.div`
  text-align: center;
  color: ${props => props.unlocked ? '#888' : '#444'};
  font-size: 0.85rem;
  margin-bottom: 8px;
`;

const ItemRarity = styled.div`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.bgColor};
  color: ${props => props.color};
  margin: 0 auto;
  display: block;
  text-align: center;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  opacity: 0.5;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #1e2a4a 0%, #151e33 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 2px solid ${props => props.rarityColor};
  box-shadow: 0 0 50px ${props => props.rarityColor}40;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.rarityColor};
    border-radius: 3px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  color: ${props => props.color};
  margin: 0;
  font-size: 1.8rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ModalIcon = styled.div`
  font-size: 5rem;
  text-align: center;
  margin-bottom: 20px;
`;

const ModalSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  color: ${props => props.color};
  margin: 0 0 10px 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.p`
  color: #b0b0b0;
  margin: 0;
  line-height: 1.8;
  font-size: 0.95rem;
`;

const BackgroundBox = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid ${props => props.color};
  padding: 15px;
  border-radius: 0 8px 8px 0;
  margin-top: 10px;
`;

const UnlockButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #e94560, #ff6b6b);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 5px 20px rgba(233, 69, 96, 0.5);
  }
  
  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.color};
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
`;

function App() {
  const [items, setItems] = useState(itemData);
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items.filter(item => {
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    const typeMatch = selectedType === 'all' || item.type === selectedType;
    return rarityMatch && typeMatch;
  });

  const unlockedCount = items.filter(i => i.unlocked).length;
  const totalCount = items.length;

  const handleUnlock = (itemId) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, unlocked: true } : item
    ));
    setSelectedItem(prev => prev ? { ...prev, unlocked: true } : null);
  };

  return (
    <AppContainer>
      <Header>
        <Title>✦ 游戏道具图鉴 ✦</Title>
        <Subtitle>探索、收集、解锁传说中的宝藏</Subtitle>
      </Header>

      <StatsBar>
        <StatItem>
          <StatValue color="#e94560">{unlockedCount}/{totalCount}</StatValue>
          <StatLabel>解锁进度</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="#10b981">{items.filter(i => i.rarity === 'rare' && i.unlocked).length}</StatValue>
          <StatLabel>稀有道具</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="#8b5cf6">{items.filter(i => i.rarity === 'epic' && i.unlocked).length}</StatValue>
          <StatLabel>史诗道具</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="#f59e0b">{items.filter(i => i.rarity === 'legendary' && i.unlocked).length}</StatValue>
          <StatLabel>传说道具</StatLabel>
        </StatItem>
      </StatsBar>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>品质：</FilterLabel>
          <FilterButton
            active={selectedRarity === 'all'}
            color="#00d4ff"
            onClick={() => setSelectedRarity('all')}
          >
            全部
          </FilterButton>
          {Object.entries(rarityConfig).map(([key, config]) => (
            <FilterButton
              key={key}
              active={selectedRarity === key}
              color={config.color}
              onClick={() => setSelectedRarity(key)}
            >
              {config.name}
            </FilterButton>
          ))}
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>类型：</FilterLabel>
          <FilterButton
            active={selectedType === 'all'}
            color="#00d4ff"
            onClick={() => setSelectedType('all')}
          >
            全部
          </FilterButton>
          {Object.entries(typeConfig).map(([key, config]) => (
            <FilterButton
              key={key}
              active={selectedType === key}
              color="#00d4ff"
              onClick={() => setSelectedType(key)}
            >
              {config.icon} {config.name}
            </FilterButton>
          ))}
        </FilterGroup>
      </FilterSection>

      <ItemsGrid>
        {filteredItems.map(item => {
          const rarity = rarityConfig[item.rarity];
          const type = typeConfig[item.type];
          return (
            <ItemCard
              key={item.id}
              rarityColor={rarity.color}
              unlocked={item.unlocked}
              onClick={() => setSelectedItem(item)}
            >
              <ItemIcon>{item.icon}</ItemIcon>
              <ItemName rarityColor={rarity.color} unlocked={item.unlocked}>
                {item.name}
              </ItemName>
              <ItemType unlocked={item.unlocked}>
                {type.icon} {type.name}
              </ItemType>
              <ItemRarity color={rarity.color} bgColor={rarity.bgColor}>
                {rarity.name}
              </ItemRarity>
              {!item.unlocked && (
                <LockedOverlay>🔒</LockedOverlay>
              )}
            </ItemCard>
          );
        })}
      </ItemsGrid>

      {selectedItem && (
        <ModalOverlay onClick={() => setSelectedItem(null)}>
          <ModalContent
            rarityColor={rarityConfig[selectedItem.rarity].color}
            onClick={e => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle color={rarityConfig[selectedItem.rarity].color}>
                {selectedItem.unlocked ? selectedItem.name : '???'}
              </ModalTitle>
              <CloseButton onClick={() => setSelectedItem(null)}>×</CloseButton>
            </ModalHeader>

            <ModalIcon>{selectedItem.icon}</ModalIcon>

            {selectedItem.unlocked ? (
              <>
                <ModalSection>
                  <SectionTitle color={rarityConfig[selectedItem.rarity].color}>
                    📋 道具详情
                  </SectionTitle>
                  <SectionContent>{selectedItem.description}</SectionContent>
                </ModalSection>

                <ModalSection>
                  <SectionTitle color={rarityConfig[selectedItem.rarity].color}>
                    📜 背景设定
                  </SectionTitle>
                  <BackgroundBox color={rarityConfig[selectedItem.rarity].color}>
                    <SectionContent>{selectedItem.background}</SectionContent>
                  </BackgroundBox>
                </ModalSection>
              </>
            ) : (
              <>
                <SectionContent style={{ textAlign: 'center', marginBottom: '20px' }}>
                  该道具尚未解锁，解锁后可查看详细信息
                </SectionContent>
                <UnlockButton onClick={() => handleUnlock(selectedItem.id)}>
                  ✨ 解锁此道具
                </UnlockButton>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </AppContainer>
  );
}

export default App;
