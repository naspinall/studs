create schema farm;

create table if not exists farm.house(
    id unique serial,
    name text,
    colour text
);

create table if not exists farm.ducks(
    id serial,
    name text,
    breed text,
    house_id int references house(id)
);

create table if not exists farm.geese(
    id serial,
    name text,
    breed text,
    house_id int references house(id)
);



