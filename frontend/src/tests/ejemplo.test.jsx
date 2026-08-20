import { render, screen } from '@testing-library/react';

function Ejemplo() {
    return <h1>TIENDA LEVIS</h1>;
}

test('Debe mostrar el título de la tienda', () => {

    render(<Ejemplo />);

    expect(
        screen.getByText('TIENDA LEVIS')
    ).toBeInTheDocument();

});