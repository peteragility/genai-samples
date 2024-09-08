
# Gomoku Game Project

## Overview

This project is part of the genai-samples repository, showcasing the power of AI-assisted coding using Cursor AI with Claude 3.5 Sonnet. It demonstrates the evolution of a simple Tic-Tac-Toe game into a full-fledged Gomoku (五子棋) game, deployed on AWS.

## Play it now!

Play the game here: [https://d3i97avilc556e.cloudfront.net/](https://d3i97avilc556e.cloudfront.net/)

## Project Evolution

1. **Tic-Tac-Toe**: Started with a basic 3x3 grid game against a computer opponent.
   
   Prompt:
   ```
   Create an AWS SAM project for a simple single-page app using JavaScript/HTML and a Node.js backend (in AWS Lambda) that allows users to play Tic-Tac-Toe against a computer opponent with easy and hard difficulty levels.
   ```

2. **Enhanced AI**: Improved the computer's move selection for a higher chance of winning.
   
   Prompt:
   ```
   Great, the game works as expected now, but the computer seems to be making moves randomly. Please make it more intelligent so that each move it makes maximizes the chance of winning, not randomly.
   ```

3. **5x5 Grid**: Expanded the game board to a 5x5 grid.
   
   Prompt:
   ```
   The game now works for 3x3. Now change the Tic-Tac-Toe game to 5x5.
   ```

4. **Gomoku Transformation**: Converted the game to Gomoku rules with visual enhancements.
   
   Prompt:
   ```
   The 5x5 game works now. Now change the game to the format of Gomoku, as stated in https://en.wikipedia.org/wiki/Gomoku. Key changes should include:
   - Rename all the user-seen text in the game to Gomoku
   - Change the marks X and O to black and white circle pieces on the gameboard; the pieces should be nice-looking and have a 3D outlook
   - Mark the winning line when the user wins or loses
   - Outline the key rules on the home page, ensuring the game board and instructions can be shown on a single page on laptop, iPad, or iPhone screens without scrolling
   ```

## Key Features

- Single-page application using JavaScript/HTML
- Node.js backend running on AWS Lambda
- 15x15 Gomoku board with black and white 3D-style pieces
- Winning line highlight
- Responsive design for laptop, iPad, and iPhone screens

### Rules of Gomoku

1. Players take turns placing their pieces (black or white) on empty intersections.
2. The goal is to form an unbroken chain of five pieces horizontally, vertically, or diagonally.
3. The first player to achieve this wins the game.

### Computer Game Play Logics

The AI opponent in this Gomoku game employs several strategies to provide a challenging experience:

1. **Winning Move Detection**: The AI prioritizes making a winning move if it can form five in a row.

2. **Blocking Opponent's Wins**: If the player is one move away from winning, the AI will block that move.

3. **Threat Creation**: The AI attempts to create "open" sequences of three or four pieces that can lead to multiple winning possibilities.

4. **Threat Response**: The AI recognizes and responds to threats created by the player, blocking potential winning sequences.

5. **Center and Key Intersections**: The AI prioritizes playing in the center and other strategically important intersections on the board.

6. **Pattern Recognition**: The AI identifies common Gomoku patterns and formations, both to create them and to disrupt the player's attempts.

7. **Balanced Play**: The AI balances between offensive moves to create winning opportunities and defensive moves to prevent player victories.

8. **Look-ahead Evaluation**: The AI evaluates potential future board states to choose moves that maximize its chances of winning.

These strategies combine to create an AI opponent that adapts to the player's style and provides a robust challenge across different skill levels.

## Technical Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js on AWS Lambda
- Hosting: AWS S3
- Deployment: AWS CloudFormation

## Repository Structure

- `/template.yaml`: AWS SAM template
- `/src`: Source code for the Lambda function
- `/public`: HTML, CSS, and client-side JavaScript

## Future Improvements

- Multiplayer functionality
- More advanced AI strategies
- Game history and statistics
