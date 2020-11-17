create schema farm;

create table if not exists farm.house(
    id serial primary key,
    name text,
    colour text
);

create table if not exists farm.ducks(
    id serial primary key,
    name text,
    breed text,
    feather_type text,
    house_id int references farm.house(id)
);

create table if not exists farm.geese(
    id serial primary key,
    name text,
    breed text,
    feather_type text,
    house_id int references farm.house(id)
);



