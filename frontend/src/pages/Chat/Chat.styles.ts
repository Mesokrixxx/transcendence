import styled from 'styled-components';

export const Content = styled.main`
  flex: 1;
  padding-block: 24px;

  h1 {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800;
    margin-bottom: 24px;
  }
`;

export const Boxes = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
