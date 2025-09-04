import { useEffect, useReducer, useState } from 'react';
import { AppShell, Container, Stack, Text, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { BattleBoards } from '@/components/BattleBoards';
import { HeaderContent } from '@/components/HeaderContent';
import { AsciiOwnBoard } from '@/components/OwnBoard';
import { PlayerNamesForm } from '@/components/PlayerNamesForm';
import { AsciiShipPlacer } from '@/components/ShipPlacer';
import { TurnTransition } from '@/components/TurnTransition';
import { gameReducer } from '@/game-engine/game-reducer';
import { type Game as GameType, type PlayerId } from '@/game-engine/game-types';
import { createGame } from '@/game-engine/utils';

export function HomePage() {
  return (
    <>
      <AppShell header={{ height: 50 }}>
        <AppShell.Header>
          <HeaderContent />
        </AppShell.Header>
        <AppShell.Main>
          <Container size="md" mx="auto">
            
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
