
export type GameStatus = 'playing' | 'won' | 'lost';

export  class Cell {
    public isMine: boolean = false;
    public isRevealed: boolean = false;
    public isFlagged: boolean = false;
    public neighborMines: number = 0;

    constructor(
      public readonly row: number,
      public readonly col: number
    ) {}

  }

export class GameBoard {
    private grid: Cell[][];
    private minesPlaced: boolean = false;
    private _minesCount: number = 0;

    constructor(
      public readonly rows: number,
      public readonly cols: number,
      minesCount: number
    ) {
      this._minesCount = Math.min(minesCount, rows * cols -1);
      this.grid = this.initializeBoard();
    }

    private initializeBoard(): Cell[][] {
      return Array.from({ length: this.rows }, (_, row) =>
        Array.from({ length: this.cols }, (_, col) => new Cell(row, col))
      );
    }

    private placeMines(firstClickRow: number, firstClickCol: number): void {
      let minesPlaced = 0;

      while (minesPlaced < this._minesCount) {
        const row = Math.floor(Math.random() * this.rows);
        const col = Math.floor(Math.random() * this.cols);

        if (
          (row !== firstClickRow || col !== firstClickCol) && 
          !this.grid[row][col].isMine
        ) {
          this.grid[row][col].isMine = true;
          minesPlaced++;
        }
      }

      this.calculateNeighborMines();
      this.minesPlaced = true;
    }

    private calculateNeighborMines(): void {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col].isMine) {
          let count = 0;
          for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (
              newRow >= 0 && newRow < this.rows &&
              newCol >= 0 && newCol < this.cols &&
              this.grid[newRow][newCol].isMine
            ) {
              count++;
            }
          }
          this.grid[row][col].neighborMines = count;
        }
      }
    }
  }

  public revealCell(row: number, col: number): boolean {
    const cell = this.getCell(row, col);

    if (cell.isRevealed || cell.isFlagged) {
      return true;
    }

    if (!this.minesPlaced) {
      this.placeMines(row, col);
    }

    cell.isRevealed = true;
    
    if (cell.isMine) {
      return false;
    }
    
    if (cell.neighborMines === 0) {
      this.revealNeighbors(row, col);
    }
    
    return true;
  }

  private revealNeighbors(row: number, col: number): void {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (
        newRow >= 0 && newRow < this.rows &&
        newCol >= 0 && newCol < this.cols
      ) {
        this.revealCell(newRow, newCol);
      }
    }
  }

  public toggleFlag(row: number, col: number): void {
    const cell = this.getCell(row, col);
    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;
    }
  }

  public getCell(row: number, col: number): Cell {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error('Cell out of bounds');
    }
    return this.grid[row][col];
  }

  public get minesCount(): number {
    return this._minesCount;
  }

  public get remainingMines(): number {
    let flaggedCount = 0;
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell.isFlagged) {
          flaggedCount++;
        }
      }
    }
    return this._minesCount - flaggedCount;
  }

  public checkWin(): boolean {
    for (const row of this.grid) {
      for (const cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  }

  public revealAllMines(): void {
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell.isMine) {
          cell.isRevealed = true;
        }
      }
    }
  }
}

export class MinesweeperGame {
  private status: GameStatus = 'playing';
  private startTime: number = Date.now();
  private endTime: number = Date.now();

  constructor(
    private board: GameBoard
  ) {}

  public revealCell(row: number, col: number): void {
    if (this.status !== 'playing') return;

    const success = this.board.revealCell(row, col);

    if (!success) {
      this.status = 'lost';
      this.endTime = Date.now();
      this.board.revealAllMines();
    } else if (this.board.checkWin()) {
      this.status = 'won';
      this.endTime = Date.now();
    }
  }

  public toggleFlag(row: number, col: number): void {
    if (this.status === 'playing') {
      this.board.toggleFlag(row, col);
    }
  }

  public get gameStatus(): GameStatus {
    return this.status;
  }

  public get isGameOver(): boolean {
    return this.status !== 'playing';
  }
public get elapsedTime(): number {
  return Math.floor(((this.endTime || Date.now()) - this.startTime) / 1000);
}
}