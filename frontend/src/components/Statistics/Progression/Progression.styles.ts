import styled from "styled-components";

export const Progression = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const EloSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
`;

export const EmptyChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-radius: 0.75rem;
  opacity: 0.7;
`;
