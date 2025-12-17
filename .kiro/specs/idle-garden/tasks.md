# Implementation Plan - Idle Garden

- [x] 1. Set up project structure and basic HTML/CSS





  - Create idle-garden directory with index.html, styles.css, and js folder
  - Implement responsive CSS layout with garden grid, shop, and resource displays
  - Set up basic HTML structure with all required UI elements
  - _Requirements: 8.4_

- [x] 2. Implement Plant class and core plant mechanics





  - [x] 2.1 Create Plant class with growth, income, and serialization methods


    - Write Plant constructor with type, level, growth progress tracking
    - Implement update() method for growth calculation and income generation
    - Add getIncomePerSecond() and getProgressPercent() methods
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Write property test for plant growth cycle income


    - **Property 3: Growth cycle income generation**
    - **Validates: Requirements 2.1**

  - [x] 2.3 Write property test for growth cycle continuity


    - **Property 4: Growth cycle continuity**
    - **Validates: Requirements 2.3**

  - [x] 2.4 Create plant configuration data and plant types


    - Define PLANT_CONFIGS with all plant types, costs, and income rates
    - Implement plant type validation and configuration lookup
    - _Requirements: 3.1, 3.5_

- [x] 3. Implement Resource Manager and Shop System





  - [x] 3.1 Create ResourceManager class for coins, seeds, and water


    - Implement resource tracking, validation, and transaction methods
    - Add resource change animation and display update methods
    - _Requirements: 4.1, 4.2_

  - [x] 3.2 Write property test for resource deduction on plant placement


    - **Property 1: Plant placement resource deduction**
    - **Validates: Requirements 1.3, 3.4**

  - [x] 3.3 Write property test for resource sufficiency validation

    - **Property 2: Resource sufficiency validation**
    - **Validates: Requirements 1.2, 1.5**

  - [x] 3.4 Create Shop class with purchase logic and affordability checking


    - Implement shop item display, cost validation, and purchase processing
    - Add affordability indicators and purchase button state management
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 3.5 Write property test for affordability display accuracy


    - **Property 12: Affordability display accuracy**
    - **Validates: Requirements 3.2, 3.3**

- [x] 4. Implement Garden Grid and Plant Management



  - [x] 4.1 Create garden grid UI with plant slots and visual feedback


    - Implement garden slot rendering, plant placement, and progress display
    - Add plant icon display and growth progress indicators
    - _Requirements: 1.1, 1.4, 2.2_

  - [x] 4.2 Implement plant placement and garden interaction logic


    - Add click handlers for plant placement and slot selection
    - Implement plant placement validation and resource deduction
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 4.3 Write property test for plant count accuracy


    - **Property 6: Plant count accuracy**
    - **Validates: Requirements 4.4**

  - [x] 4.4 Add garden statistics display and income calculation


    - Implement total income per second calculation across all plants
    - Add plant count display and garden statistics panel
    - _Requirements: 4.3, 4.4_

  - [x] 4.5 Write property test for income calculation accuracy


    - **Property 5: Income calculation accuracy**
    - **Validates: Requirements 4.3**

- [x] 5. Implement Upgrade System





  - [x] 5.1 Create UpgradeSystem class with upgrade types and effects


    - Define upgrade types (growth speed, income boost, efficiency)
    - Implement upgrade purchase logic and effect application
    - _Requirements: 5.1, 5.2_

  - [x] 5.2 Write property test for upgrade effect application


    - **Property 7: Upgrade effect application**
    - **Validates: Requirements 5.2**

  - [x] 5.3 Write property test for growth speed upgrade consistency

    - **Property 8: Growth speed upgrade consistency**
    - **Validates: Requirements 5.3**

  - [x] 5.4 Write property test for income upgrade consistency

    - **Property 9: Income upgrade consistency**
    - **Validates: Requirements 5.4**

  - [x] 5.5 Integrate upgrades with plant system and UI display


    - Apply upgrade effects to existing and new plants
    - Add upgrade UI with descriptions, costs, and purchase buttons
    - _Requirements: 5.3, 5.4, 5.5_

- [x] 6. Implement Game Engine and Main Loop





  - [x] 6.1 Create GameEngine class with update loop and system coordination


    - Implement main game loop with plant updates and income generation
    - Add system coordination between plants, shop, upgrades, and resources
    - _Requirements: 2.4, 2.5_

  - [x] 6.2 Add notification system for game events


    - Implement notification display for income, purchases, and errors
    - Add notification stacking, auto-dismiss, and visual feedback
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 6.3 Implement UI updates and visual feedback systems


    - Add resource counter animations and visual feedback for income
    - Implement button feedback and interaction visual responses
    - _Requirements: 4.5, 8.5_

- [x] 7. Implement Save/Load System





  - [x] 7.1 Create SaveSystem class with localStorage persistence


    - Implement game state serialization and deserialization
    - Add manual save functionality and save confirmation feedback
    - _Requirements: 6.2, 6.5_

  - [x] 7.2 Write property test for save/load state preservation


    - **Property 10: Save/load state preservation**
    - **Validates: Requirements 6.3**

  - [x] 7.3 Implement auto-save functionality with 30-second intervals


    - Add automatic save timer and background save operations
    - Implement save error handling and user notification
    - _Requirements: 6.1_

  - [x] 7.4 Add offline progress calculation for returning players


    - Calculate offline earnings based on elapsed time and plant income
    - Display offline progress summary when loading saved games
    - _Requirements: 6.4_

  - [x] 7.5 Write property test for offline progress calculation


    - **Property 11: Offline progress calculation**
    - **Validates: Requirements 6.4**

- [x] 8. Implement Game Controls and Settings





  - [x] 8.1 Add reset functionality with confirmation dialog


    - Implement game reset with progress clearing and storage cleanup
    - Add reset confirmation to prevent accidental data loss
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Write property test for reset state clearing


    - **Property 15: Reset state clearing**
    - **Validates: Requirements 8.1, 8.2**

  - [x] 8.3 Add sound toggle and settings management


    - Implement sound enable/disable functionality
    - Add settings persistence and audio feedback control
    - _Requirements: 8.3_

  - [x] 8.4 Implement responsive design and mobile optimization


    - Add mobile-friendly touch interactions and responsive layout
    - Optimize UI for various screen sizes and device types
    - _Requirements: 8.4_

- [x] 9. Add remaining property tests and validation




  - [x] 9.1 Write property test for resource display completeness


    - **Property 13: Resource display completeness**
    - **Validates: Requirements 4.1**

  - [x] 9.2 Write property test for shop information completeness


    - **Property 14: Shop information completeness**
    - **Validates: Requirements 3.5**

- [x] 10. Final integration and testing






  - [x] 10.1 Integrate all systems and test complete game flow



    - Connect all game systems and verify end-to-end functionality
    - Test complete gameplay loop from planting to earning to upgrading
    - _Requirements: All_

  - [x] 10.2 Write integration tests for cross-system interactions


    - Test plant-upgrade interactions and resource-shop coordination
    - Verify save/load with complex game states
    - _Requirements: All_

- [x] 11. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.