import styled from 'styled-components';

export const Legend = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  min-width: 0;
`;

export const Label = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-height: 2.5rem;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
`;

export const Indicator = styled.span<{ $color: string }>`
  width: 0.55rem;
  height: 0.55rem;
  flex-shrink: 0;
  margin-top: 0.3rem;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
`;
export const PercentageAndCount = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

export const Percentage = styled.div`
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

export const Count = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
`;
