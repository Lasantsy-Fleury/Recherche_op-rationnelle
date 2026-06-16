import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class MatrixHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  name!: string;

  @Column('text')
  mode!: 'min' | 'max';

  @Column('simple-json')
  rows!: string[];

  @Column('simple-json')
  cols!: string[];

  @Column('simple-json')
  grid!: number[][];

  @CreateDateColumn()
  createdAt!: Date;
}
