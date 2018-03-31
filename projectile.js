class projectile
{
	constructor(typeName, location, vector)
	{
		this.class = "projectile";
		this.type = typeName;

		if(location === undefined || location === null)
		{
			throw "No location provided for projectile.";
			return;
		}

		if(vector === undefined || location === null)
		{
			throw "No vector provided for projectile.";
			return;
		}

		this.location = {x: location.x, y: location.y};
		this.rotation = {x: vector.x, y: vector.y};

		switch(typeName)
		{
			case "fireball":
				this.name = "Fire Ball";
				this.character = "*";
				this.directDamage = 2;
				break;

			case "frostbolt":
				this.name = "Frost Bolt";
				this.character = "-";
				this.directDamage = 8;
				break;

			case "firestorm":
				this.name = "Fire Storm";
				this.character = "*";
				this.directDamage = 20;
				break;

			case "giestflame":
				this.name = "Giestflame";
				this.character = "*";
				this.directDamage = 3.5;
				break;

			case "snowball":
				this.name = "Snowball";
				this.character = "+";
				this.directDamage = 2.5;
				break;

			case "magic_missle":
				this.name = "Magic Missle";
				this.character = "-";
				this.directDamage = 9;
				this.bouncesLeft = 3;
				break;

			case "concussive_missle":
				this.name = "Concussion Missle";
				this.character = "-";
				this.directDamage = 5;
				break;

			default:
				throw "Unknown type for projectile " + typeName;
				return;
		}

		this.tile = undefined;
		let currentTile = getWorld(this.getLocation());

		if(currentTile.projectile !== null)
		{
			this.explode();
			currentTile.explode();
		}
		else
		{
			currentTile.projectile = this;
			this.tile = currentTile;
		}

		projectiles.push(this);
	}

	getName()
	{
		return this.name;
	}

	getDescription()
	{
		return this.description;
	}

	getCharacter()
	{
		return this.character;
	}

	getLocation()
	{
		return {x: Math.round(this.location.x), y: Math.round(this.location.y)};
	}

	getExactLocation()
	{
		return {x: this.location.x, y: this.location.y};
	}

	tick()
	{
		this.location = vectorAdd(this.getExactLocation(), this.rotation);
		this.tile.projectile = null;
		let newTile = getWorld(this.getLocation());

		if(newTile != this.tile)
		{
			if(newTile.projectile !== null)
			{
				this.explode();
				newTile.projectile.explode();
			}

			this.tile = newTile;
			this.tile.projectile = this;

			if(this.tile.unit !== null)
			{
				this.collideUnit(this.tile.unit);
				return;
			}

			if(!this.tile.base.permitsVision)
			{
				this.collideWall(this.tile.base);
				return;
			}
		}

		switch(this.type)
		{
			case "firestorm":
				if(this.tile.hazard !== null)
					this.tile.hazard.remove();

				this.tile.hazard = new hazard("bigfire", this.getLocation());
				break;
		}
	}

	collideUnit(unit)
	{
		let doExplosion = true;

		switch(this.type)
		{
			case "fireball":
				if(unit.class == "player")
					addLog("You're immolated by the fireball!");
				else
					addLog("The " + unit.getName() + " is immolated by the fireball!");

				break;

			case "frostbolt":
				if(unit.class == "player")
					addLog("You're chilled by the frost bolt!");
				else
					addLog("The " + unit.getName() + " is chilled by the frost bolt!");

					unit.stamina -= 15;
				break;

			case "firestorm":
				if(unit.class == "player")
					addLog("You're caught directly in the firestorm!");
				else if(unit.health < this.directDamage)
				{
					addLog("The " + unit.getName() + " is vaporized by the firestorm, but it keeps going!");
					doExplosion = false;
				}
				else
					addLog("The " + unit.getName() + " is caught directly in the firestorm!");

				if(this.tile.hazard !== null)
					this.tile.hazard.remove();

				this.tile.hazard = new hazard("bigfire", this.getLocation());
				break;

			case "giestflame":
				if(unit.class == "player")
					addLog("You're burned by the giestflame!");
				else
					addLog("The " + unit.getName() + " is burned by the giestflame!");

				break;

			case "snowball":
				if(unit.class == "player")
					addLog("You're pelted by the snowball!");
				else
					addLog("The " + unit.getName() + " is chilled by the snowball!");

				unit.stamina -= 5;
				break;

			case "magic_missle":
				if(unit.class == "player")
					addLog("The magic missle shoves you down as it explodes on you!");
				else
					addLog("The magic missle explodes on the " + unit.getName() + "!");

				break;

			case "concussive_missle":
				unit.stun += getRandom(1, 3);

				if(unit.class == "player")
					addLog("The concussive missle knocks the wind out of you!");
				else
					addLog("The concussive missle stuns the " + unit.getName() + "!");
				break;
		}

		unit.health -= this.directDamage;

		if(doExplosion)
			this.explode();
	}

	collideWall(tileBase)
	{
		switch(this.type)
		{
			case "fireball":
				addLog("The fireball slams into the " + tileBase.getName().toLowerCase() + " and explodes!");
				break;

			case "frostbolt":
				addLog("The frostbolt leaves an icy mark on the " + tileBase.getName().toLowerCase() + " as it hits.");
				break;

			case "firestorm":
				addLog("The firestorm ends as it crashes into the " + tileBase.getName().toLowerCase() + ".");
				break;

			case "giestflame":
				addLog("The giestflame fizzles out as it hits the " + tileBase.getName().toLowerCase() + ".");
				break;

			case "snowball":
				addLog("The snowball makes a small splat as it collides with the " + tileBase.getName().toLowerCase() + ".");
				break;

			case "magic_missle":
				if(this.bouncesLeft > 0)
				{
					this.bouncesLeft--;
					this.rotation = vectorScale(this.rotation, -1);
					addLog("The magic missle bounces off the " + tileBase.getName().toLowerCase() + " like a rubber ball!");
					return;
				}
				else
					addLog("The magic missle explodes as it hits the " + tileBase.getName().toLowerCase() + "!");
				break;

			case "concussive_missle":
				addLog("The concussive missle makes a loud bang as it hits the " + tileBase.getName().toLowerCase() + "!");
				break;
		}

		this.explode();
	}

	explode()
	{
		let location;

		switch(this.type)
		{
			case "fireball":
				location = this.getLocation();

				for(let x = location.x - 2; x <= location.x + 2; x++)
				{
					for(let y = location.y - 2; y <= location.y + 2; y++)
					{
						let tile = getWorld({x: x, y: y});

						if(!tile.base.permitsTravel)
							continue;

						if(tile.hazard !== null)
							tile.hazard.remove();

						if(tile.unit !== null)
							tile.unit.health -= 4;

						tile.hazard = new hazard("bigfire", tile.location);
					}
				}
				break;

			case "magic_missle":
				location = this.getLocation();

				for(let x = location.x - 1; x <= location.x + 1; x++)
				{
					for(let y = location.y - 1; y <= location.y + 1; y++)
					{
						if(Math.random() > 0.3)
							continue;

						let tile = getWorld({x: x, y: y});

						if(!tile.base.permitsTravel)
							continue;

						if(tile.hazard !== null)
							tile.hazard.remove();

						if(tile.unit !== null)
							tile.unit.health -= 4;

						tile.hazard = new hazard("bigfire", tile.location);
					}
				}
				break;
		}

		this.remove();
	}

	remove()
	{
		for(let i = 0; i < projectiles.length; i++)
			if(projectiles[i] == this)
			{
				projectiles.splice(i, 1);
				break;
			}

		if(this.tile.projectile == this)
			this.tile.projectile = null;

	}
}