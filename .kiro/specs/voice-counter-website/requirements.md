# Requirements Document

## Introduction

A voice-activated scoreboard website that allows users to increment, decrement, and reset point counters for two competing sides using spoken voice commands. The interface displays both sides' scores in real time and is suitable for use cases like debates, sports scoring, games, or any two-party competition.

## Glossary

- **App**: The voice counter web application as a whole.
- **Scoreboard**: The visual display showing both sides' current point totals.
- **Side**: One of the two competing parties displayed on the Scoreboard (e.g., "Team A" and "Team B", or "Side 1" and "Side 2").
- **Score**: The current integer point total for a given Side.
- **Voice_Command**: A spoken phrase captured by the browser's speech recognition API and interpreted by the App.
- **Speech_Recognizer**: The component responsible for capturing microphone input and converting it to text.
- **Command_Parser**: The component responsible for interpreting recognized text into structured actions.
- **Scoreboard_Display**: The UI component that renders both Sides and their Scores.
- **Listening_Indicator**: A visual element that shows whether the Speech_Recognizer is actively listening.

---

## Requirements

### Requirement 1: Display Two-Sided Scoreboard

**User Story:** As a user, I want to see both sides and their scores on screen at the same time, so that I can track the current state of the competition at a glance.

#### Acceptance Criteria

1. THE Scoreboard_Display SHALL render two Sides simultaneously on the same page.
2. THE Scoreboard_Display SHALL show the name of each Side alongside its current Score.
3. THE Scoreboard_Display SHALL initialize each Side's Score to 0 when the App loads.
4. WHEN a Score changes, THE Scoreboard_Display SHALL update the displayed value within 100ms.

---

### Requirement 2: Voice Command Activation

**User Story:** As a user, I want to control the scoreboard using my voice, so that I can keep score hands-free.

#### Acceptance Criteria

1. WHEN the user activates the microphone, THE Speech_Recognizer SHALL begin capturing audio input from the user's microphone.
2. WHEN the Speech_Recognizer captures audio, THE Speech_Recognizer SHALL convert the audio to text and pass it to the Command_Parser.
3. IF the browser does not support the Web Speech API, THEN THE App SHALL display a message informing the user that voice commands are not supported.
4. IF microphone permission is denied by the user, THEN THE App SHALL display a message prompting the user to grant microphone access.
5. THE Listening_Indicator SHALL reflect the current listening state of the Speech_Recognizer at all times.

---

### Requirement 3: Voice Command Parsing

**User Story:** As a user, I want to say natural phrases to add or remove points, so that scoring feels intuitive and fast.

#### Acceptance Criteria

1. WHEN the Command_Parser receives recognized text, THE Command_Parser SHALL identify the target Side from the text.
2. WHEN the Command_Parser receives recognized text containing an increment instruction, THE Command_Parser SHALL produce an increment action for the identified Side.
3. WHEN the Command_Parser receives recognized text containing a decrement instruction, THE Command_Parser SHALL produce a decrement action for the identified Side.
4. WHEN the Command_Parser receives recognized text containing a reset instruction, THE Command_Parser SHALL produce a reset action for the identified Side or for all Sides.
5. IF the Command_Parser cannot match the recognized text to a known command, THEN THE App SHALL display a brief feedback message indicating the command was not recognized.
6. THE Command_Parser SHALL recognize side references using both the configured Side names and positional terms such as "left" and "right".

---

### Requirement 4: Score Manipulation

**User Story:** As a user, I want voice commands to accurately update scores, so that the scoreboard reflects the correct totals.

#### Acceptance Criteria

1. WHEN an increment action is applied to a Side, THE App SHALL increase that Side's Score by 1.
2. WHEN a decrement action is applied to a Side, THE App SHALL decrease that Side's Score by 1.
3. WHEN a reset action is applied to a Side, THE App SHALL set that Side's Score to 0.
4. WHEN a reset action is applied to all Sides, THE App SHALL set every Side's Score to 0.
5. WHILE a Side's Score is 0, THE App SHALL prevent decrement actions from reducing the Score below 0.

---

### Requirement 5: Customizable Side Names

**User Story:** As a user, I want to set custom names for each side, so that the scoreboard reflects the actual competitors.

#### Acceptance Criteria

1. THE App SHALL provide an input field for each Side's name.
2. WHEN the user updates a Side's name, THE Scoreboard_Display SHALL reflect the new name immediately.
3. THE App SHALL use the updated Side names as valid targets when the Command_Parser interprets Voice_Commands.
4. IF a Side name is left empty, THEN THE App SHALL use a default name (e.g., "Side 1" and "Side 2").

---

### Requirement 6: Manual Score Controls

**User Story:** As a user, I want on-screen buttons to adjust scores manually, so that I can correct mistakes or use the app without voice input.

#### Acceptance Criteria

1. THE Scoreboard_Display SHALL render increment, decrement, and reset buttons for each Side.
2. WHEN the user clicks an increment button, THE App SHALL apply an increment action to the corresponding Side.
3. WHEN the user clicks a decrement button, THE App SHALL apply a decrement action to the corresponding Side.
4. WHEN the user clicks a reset button, THE App SHALL apply a reset action to the corresponding Side.

---

### Requirement 7: Command Feedback

**User Story:** As a user, I want to see what command was recognized, so that I can confirm the app heard me correctly.

#### Acceptance Criteria

1. WHEN the Command_Parser processes a Voice_Command, THE App SHALL display the recognized text on screen.
2. WHEN the Command_Parser produces a valid action, THE App SHALL display a brief confirmation of the action taken.
3. WHEN the Command_Parser cannot match a command, THE App SHALL display the unrecognized text alongside a "not recognized" message.
4. THE App SHALL clear the command feedback display after 3 seconds.
