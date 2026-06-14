using UserService.DTOs;

namespace UserService.Services
{
    public interface IAuthService
    {
        Task<string> Register(RegisterDto dto);
        Task<string> Login(LoginDto dto);
        Task<UserDto> GetUser(int id);
        Task<List<UserDto>> GetAllUsers();
        Task<UserDto> UpdateUserRole(int id, string role);
        Task DeleteUser(int id);
    }
}