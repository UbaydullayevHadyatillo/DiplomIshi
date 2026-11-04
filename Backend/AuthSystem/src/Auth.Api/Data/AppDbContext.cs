using Auth.Api.Models;
using Auth.Api.Models.Identity;
using Auth.Api.Models.Lms;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<VerificationCode> VerificationCodes => Set<VerificationCode>();
    public DbSet<TelegramLinkRequest> TelegramLinkRequests => Set<TelegramLinkRequest>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<ExamResult> ExamResults => Set<ExamResult>();
    public DbSet<TestResult> TestResults => Set<TestResult>(); 

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // AppUser
        modelBuilder.Entity<AppUser>()
            .HasIndex(x => x.UserName).IsUnique();
        modelBuilder.Entity<AppUser>()
            .HasIndex(x => x.PhoneNumber).IsUnique();

        // RefreshToken
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(x => x.Token).IsUnique();
        modelBuilder.Entity<RefreshToken>()
            .HasOne(x => x.User)
            .WithMany(x => x.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // VerificationCode
        modelBuilder.Entity<VerificationCode>()
            .HasOne(x => x.User)
            .WithMany(x => x.VerificationCodes)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // TelegramLinkRequest
        modelBuilder.Entity<TelegramLinkRequest>()
            .HasIndex(x => x.LinkCode).IsUnique();
        modelBuilder.Entity<TelegramLinkRequest>()
            .HasOne(x => x.User)
            .WithMany(x => x.TelegramLinkRequests)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Question
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Subject)
            .WithMany(s => s.Questions)
            .HasForeignKey(q => q.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // Option
        modelBuilder.Entity<Option>()
            .HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // ExamResult
        modelBuilder.Entity<ExamResult>()
            .HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ExamResult>()
            .HasOne(e => e.Subject)
            .WithMany()
            .HasForeignKey(e => e.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // TestResult
        modelBuilder.Entity<TestResult>()
            .HasOne(t => t.ExamResult)
            .WithMany(e => e.Details)
            .HasForeignKey(t => t.ExamResultId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}