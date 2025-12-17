# Requirements Document - Idle Garden

## Introduction

Idle Garden is a passive incremental game where players grow virtual plants to earn coins automatically. The game focuses on minimal user interaction while providing satisfying progression through plant cultivation, resource management, and strategic upgrades. Players can plant different types of crops, watch them grow in real-time, and reinvest earnings into better plants and upgrades for exponential growth.

## Glossary

- **Idle Garden System**: The complete game application including UI, game logic, and persistence
- **Plant**: A virtual crop that generates coins over time when planted
- **Garden Grid**: The visual area where plants are displayed and managed
- **Resource**: Game currencies including coins, seeds, and water
- **Growth Cycle**: The time period from planting to harvest for a plant
- **Upgrade**: Permanent improvements that enhance game mechanics
- **Auto-Save**: Automatic game state persistence without user action

## Requirements

### Requirement 1

**User Story:** As a player, I want to plant different types of crops in my garden, so that I can start earning coins automatically.

#### Acceptance Criteria

1. WHEN a player selects a plant type from the shop THEN the Idle Garden System SHALL display available planting slots in the garden grid
2. WHEN a player clicks on an empty garden slot THEN the Idle Garden System SHALL plant the selected crop if resources are sufficient
3. WHEN a plant is successfully planted THEN the Idle Garden System SHALL deduct the required seeds, water, and coins from player resources
4. WHEN a plant is planted THEN the Idle Garden System SHALL display the plant icon and start the growth timer immediately
5. WHERE sufficient resources are available, WHEN a player attempts to plant THEN the Idle Garden System SHALL allow the planting action

### Requirement 2

**User Story:** As a player, I want my plants to grow automatically and generate coins, so that I can earn money without constant interaction.

#### Acceptance Criteria

1. WHEN a plant completes its growth cycle THEN the Idle Garden System SHALL add coins to the player's balance automatically
2. WHILE a plant is growing THEN the Idle Garden System SHALL display a visual progress indicator showing growth completion percentage
3. WHEN a plant finishes growing THEN the Idle Garden System SHALL immediately restart the growth cycle for continuous income
4. WHEN the game is running THEN the Idle Garden System SHALL update all plant growth progress every second
5. WHEN a plant generates income THEN the Idle Garden System SHALL display the earned coins with visual feedback

### Requirement 3

**User Story:** As a player, I want to purchase different plant types with varying costs and income rates, so that I can optimize my earning strategy.

#### Acceptance Criteria

1. WHEN a player views the shop THEN the Idle Garden System SHALL display all available plant types with their costs and income rates
2. WHEN a player has insufficient resources THEN the Idle Garden System SHALL disable the purchase option and show the item as unaffordable
3. WHEN a player has sufficient resources THEN the Idle Garden System SHALL highlight affordable items and enable purchase buttons
4. WHEN a player purchases a plant type THEN the Idle Garden System SHALL deduct the exact cost from player resources
5. WHEN displaying plant information THEN the Idle Garden System SHALL show name, icon, cost breakdown, and income per growth cycle

### Requirement 4

**User Story:** As a player, I want to see my total income rate and resource counts, so that I can track my progress and make informed decisions.

#### Acceptance Criteria

1. WHEN the game displays resources THEN the Idle Garden System SHALL show current coins, seeds, and water with clear labels
2. WHEN resources change THEN the Idle Garden System SHALL update the display immediately with visual animation
3. WHEN plants are active THEN the Idle Garden System SHALL calculate and display total income per second across all plants
4. WHEN viewing garden statistics THEN the Idle Garden System SHALL show total number of planted crops
5. WHEN income is generated THEN the Idle Garden System SHALL animate the coin counter to show the increase

### Requirement 5

**User Story:** As a player, I want to purchase upgrades that improve my garden's efficiency, so that I can accelerate my progress.

#### Acceptance Criteria

1. WHEN a player views upgrades THEN the Idle Garden System SHALL display available improvements with descriptions and costs
2. WHEN a player purchases an upgrade THEN the Idle Garden System SHALL apply the improvement permanently to all applicable plants
3. WHEN an upgrade affects growth speed THEN the Idle Garden System SHALL reduce growth time for all current and future plants
4. WHEN an upgrade affects income THEN the Idle Garden System SHALL increase coin generation for all plants immediately
5. WHERE upgrade prerequisites are met, WHEN a player attempts purchase THEN the Idle Garden System SHALL allow the upgrade transaction

### Requirement 6

**User Story:** As a player, I want my game progress to be saved automatically, so that I don't lose my progress when I close the game.

#### Acceptance Criteria

1. WHEN the game runs for 30 seconds THEN the Idle Garden System SHALL automatically save all game state to browser storage
2. WHEN a player manually clicks save THEN the Idle Garden System SHALL immediately persist current game state
3. WHEN a player loads the game THEN the Idle Garden System SHALL restore all plants, resources, and upgrades from saved data
4. WHEN loading saved plants THEN the Idle Garden System SHALL calculate offline progress and award appropriate coins
5. WHEN save operations occur THEN the Idle Garden System SHALL provide visual confirmation of successful save

### Requirement 7

**User Story:** As a player, I want to receive notifications for important game events, so that I stay informed about my garden's progress.

#### Acceptance Criteria

1. WHEN a plant completes growth THEN the Idle Garden System SHALL display a notification showing coins earned
2. WHEN a player makes a purchase THEN the Idle Garden System SHALL show confirmation notification with item details
3. WHEN an error occurs THEN the Idle Garden System SHALL display error notifications with clear problem descriptions
4. WHEN notifications appear THEN the Idle Garden System SHALL auto-dismiss them after 3 seconds
5. WHEN multiple notifications occur THEN the Idle Garden System SHALL stack them vertically without overlap

### Requirement 8

**User Story:** As a player, I want responsive controls for game management, so that I can easily reset progress or toggle settings.

#### Acceptance Criteria

1. WHEN a player clicks the reset button THEN the Idle Garden System SHALL clear all progress and return to initial state
2. WHEN a player confirms reset THEN the Idle Garden System SHALL remove all saved data from browser storage
3. WHEN a player toggles sound THEN the Idle Garden System SHALL enable or disable audio feedback accordingly
4. WHEN a player uses mobile device THEN the Idle Garden System SHALL adapt the interface for touch interaction
5. WHEN control buttons are pressed THEN the Idle Garden System SHALL provide immediate visual feedback